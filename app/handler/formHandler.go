package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/TedMartell/RemoteMinerWebpage/app/util"
)

func FormHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		fmt.Fprintf(w, "ParseForm() err: %v", err)
		return
	}

	username := r.FormValue("username")

	ticketid := util.GenerateTicketID(7)

	fmt.Fprintf(w, "Hello "+username+"\n")
	eventname := r.FormValue("eventname")
	eventlocation := r.FormValue("eventlocation")
	ticketprice := r.FormValue("ticketprice")
	ticketquantity := r.FormValue("ticketquantity")

	price, err := strconv.ParseFloat(ticketprice, 64)
	if err != nil {
		fmt.Fprintf(w, "Error converting ticket price: %v", err)
		return
	}

	// Convert ticketquantity to int
	quantity, err := strconv.Atoi(ticketquantity)
	if err != nil {
		fmt.Fprintf(w, "Error converting ticket quantity: %v", err)
		return
	}

	// Calculate total cost
	totalCost := price * float64(quantity)

	fmt.Fprintf(w, "Event Name = %s\n", eventname)
	fmt.Fprintf(w, "Your Ticket ID is %s\n", ticketid)
	fmt.Fprintf(w, "You're off to %s\n", eventlocation)
	fmt.Fprintf(w, "Ticket Price = %s\n", ticketprice)
	fmt.Fprintf(w, "Ticket Quantity = %s\n", ticketquantity)
	fmt.Fprintf(w, "Total Cost = %.2f\n", totalCost)

}
