package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "password"

	// Generate hash with cost 10 (same as used in the app)
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Hash: %s\n", string(hash))

	// Verify the hash works
	err = bcrypt.CompareHashAndPassword(hash, []byte(password))
	if err != nil {
		fmt.Println("Hash verification failed!")
	} else {
		fmt.Println("Hash verification successful!")
	}
}
