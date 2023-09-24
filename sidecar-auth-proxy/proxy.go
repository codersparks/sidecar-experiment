package main

import (
	"io"
	"log"
	"net/http"
)

var customTransport = http.DefaultTransport

var APP_AUTH_HEADER_NAME = "x-app-auth"
var APP_AUTH_HEADER_USER = "USER"
var APP_AUTH_HEADER_ADMIN = "ADMIN"

var APP_PROXY_AUTH_HEADER_NAME = "x-proxy-app-auth"
var APP_PROXY_AUTH_USER = "PERSON"
var APP_PROXY_AUTH_ADMIN = "SUPER"

func init() {

}

func updateHeaders(r *http.Request) {

	xAppAuthHeader := r.Header.Get(APP_AUTH_HEADER_NAME)
	log.Println(APP_AUTH_HEADER_NAME, "value:", xAppAuthHeader)

	// Here we assume that as the correct header for the app is set then we can just assume they know what they're doing
	if xAppAuthHeader != "" {
		return
	}

	// Now we check to see if the request contains the header in APP_PROXY_AUTH_HEADER_NAME and do logic on that value
	xAppProxyAuthHeader := r.Header.Get(APP_PROXY_AUTH_HEADER_NAME)
	log.Println(APP_PROXY_AUTH_HEADER_NAME, "value:", xAppProxyAuthHeader)

	if xAppProxyAuthHeader != "" {

		if xAppProxyAuthHeader == APP_PROXY_AUTH_ADMIN {
			r.Header.Set(APP_AUTH_HEADER_NAME, APP_AUTH_HEADER_ADMIN)
			return
		}

		if xAppProxyAuthHeader == APP_PROXY_AUTH_USER {
			r.Header.Set(APP_AUTH_HEADER_NAME, APP_AUTH_HEADER_USER)
			return
		}
	}

}

func handleRequest(w http.ResponseWriter, r *http.Request) {

	// Create a new HTTP request with the same method, URL, and body
	targetPath := r.URL
	targetURL := "http://localhost:3000" + targetPath.String()
	log.Println("Target path: ", targetPath, " Target URL: ", targetURL)
	proxyReq, err := http.NewRequest(r.Method, targetURL, r.Body)
	if err != nil {
		http.Error(w, "Error creating proxy request", http.StatusInternalServerError)
		return
	}

	updateHeaders(r)

	log.Println("Copying headers from original request")
	// Copy the headers from the original request to the proxy request
	for name, values := range r.Header {
		for _, value := range values {
			log.Println("Seting header: ", name, " to value: ", value)
			proxyReq.Header.Add(name, value)
		}
	}

	// Send the proxy request using the  custom transport
	resp, err := customTransport.RoundTrip(proxyReq)
	if err != nil {
		http.Error(w, "Error sending proxy request", http.StatusInternalServerError)
		return
	}

	defer resp.Body.Close()

	// Copy the headers from the poroxy response to the original response
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}

	// Set the status code of the original response to the status code of the proxy response
	w.WriteHeader(resp.StatusCode)

	// Copy the body of the proxy response to the original response
	io.Copy(w, resp.Body)
}

func main() {
	// Create a new HTTP server with the handleRequest function as the handler
	server := http.Server{
		Addr:    ":3001",
		Handler: http.HandlerFunc(handleRequest),
	}

	// Start the server and log any errors
	log.Println("Starting proxy server on :3001")
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("Error stating proxy server: ", err)
	}
}
