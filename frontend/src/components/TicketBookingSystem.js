import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import "../styles/TicketBookingSystem.css";

const TRAIN_DATA = {
  "Goa": [
    { id: "T101", name: "Mandovi Express", number: "10111", dep: "07:10 AM", arr: "06:45 PM", dur: "11h 35m", classes: { SL: { code: "Sleeper (SL)", price: 420, avail: 14 }, "3A": { code: "AC 3 Tier (3A)", price: 1100, avail: 4 }, "2A": { code: "AC 2 Tier (2A)", price: 1600, avail: 2 }, "1A": { code: "AC First Class (1A)", price: 2800, avail: 0 } } },
    { id: "T102", name: "Goa Smruti Tejas Express", number: "22119", dep: "05:50 AM", arr: "02:10 PM", dur: "8h 20m", classes: { SL: { code: "Sleeper (SL)", price: 550, avail: 32 }, "3A": { code: "AC 3 Tier (3A)", price: 1350, avail: 12 }, "2A": { code: "AC 2 Tier (2A)", price: 1950, avail: 5 }, "1A": { code: "AC First Class (1A)", price: 3400, avail: 1 } } },
    { id: "T103", name: "Mangaluru Matsyagandha Exp", number: "12619", dep: "03:20 PM", arr: "11:55 PM", dur: "8h 35m", classes: { SL: { code: "Sleeper (SL)", price: 380, avail: 45 }, "3A": { code: "AC 3 Tier (3A)", price: 950, avail: 24 }, "2A": { code: "AC 2 Tier (2A)", price: 1450, avail: 14 }, "1A": { code: "AC First Class (1A)", price: 2400, avail: 4 } } }
  ],
  "Jaipur": [
    { id: "T201", name: "New Delhi - Jaipur Shatabdi", number: "12015", dep: "06:10 AM", arr: "10:45 AM", dur: "4h 35m", classes: { SL: { code: "Chair Car (CC)", price: 540, avail: 28 }, "3A": { code: "AC Chair Car", price: 820, avail: 18 }, "2A": { code: "Executive Class (EC)", price: 1450, avail: 3 }, "1A": { code: "Anubhuti Class (EA)", price: 1980, avail: 1 } } },
    { id: "T202", name: "Ajmer Double Decker Exp", number: "12986", dep: "05:35 PM", arr: "10:05 PM", dur: "4h 30m", classes: { SL: { code: "Chair Car (CC)", price: 450, avail: 50 }, "3A": { code: "AC Chair Car", price: 680, avail: 25 }, "2A": { code: "Executive Class (EC)", price: 1200, avail: 6 }, "1A": { code: "Anubhuti Class (EA)", price: 1700, avail: 0 } } }
  ],
  "Kerala": [
    { id: "T301", name: "Bangalore - Ernakulam Intercity", number: "12677", dep: "06:15 AM", arr: "04:55 PM", dur: "10h 40m", classes: { SL: { code: "Sleeper (SL)", price: 390, avail: 12 }, "3A": { code: "AC 3 Tier (3A)", price: 1050, avail: 8 }, "2A": { code: "AC 2 Tier (2A)", price: 1550, avail: 2 }, "1A": { code: "AC First Class (1A)", price: 2500, avail: 0 } } },
    { id: "T302", name: "Kochuveli Garib Rath Exp", number: "12257", dep: "08:15 PM", arr: "09:30 AM", dur: "13h 15m", classes: { SL: { code: "AC 3 Tier (3A)", price: 790, avail: 60 }, "3A": { code: "AC 3 Tier (3A)", price: 790, avail: 60 }, "2A": { code: "AC 3 Tier (3A)", price: 790, avail: 60 }, "1A": { code: "AC 3 Tier (3A)", price: 790, avail: 60 } } }
  ],
  "Manali": [
    { id: "T401", name: "Kalka Shatabdi Express", number: "12005", dep: "05:15 AM", arr: "08:35 AM", dur: "3h 20m", classes: { SL: { code: "Chair Car (CC)", price: 650, avail: 18 }, "3A": { code: "AC Chair Car", price: 920, avail: 11 }, "2A": { code: "Executive Class (EC)", price: 1500, avail: 2 }, "1A": { code: "Anubhuti Class (EA)", price: 2100, avail: 0 } } }
  ],
  "Udaipur": [
    { id: "T501", name: "Chetak Express", number: "20473", dep: "07:40 PM", arr: "07:50 AM", dur: "12h 10m", classes: { SL: { code: "Sleeper (SL)", price: 380, avail: 22 }, "3A": { code: "AC 3 Tier (3A)", price: 990, avail: 14 }, "2A": { code: "AC 2 Tier (2A)", price: 1400, avail: 5 }, "1A": { code: "AC First Class (1A)", price: 2350, avail: 2 } } }
  ]
};

export default function TicketBookingSystem() {
  const { addBooking } = useApp();

  const [searchParams, setSearchParams] = useState({
    from: "New Delhi (NDLS)",
    to: "Goa",
    date: new Date().toISOString().split("T")[0]
  });

  const [activeTrains, setActiveTrains] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bookingStep, setBookingStep] = useState("search"); // search -> passengers -> seating -> checkout -> ticket

  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "Male", berth: "No Preference" }]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    const destKey = searchParams.to;
    // Fallback if destination not in static mock data
    const results = TRAIN_DATA[destKey] || TRAIN_DATA["Goa"];
    setActiveTrains(results);
    setSelectedTrain(null);
    setSelectedClass(null);
  };

  const selectTrainClass = (train, clsKey) => {
    setSelectedTrain(train);
    setSelectedClass(train.classes[clsKey]);
    setBookingStep("passengers");
  };

  const addPassenger = () => {
    setPassengers((prev) => [...prev, { name: "", age: "", gender: "Male", berth: "No Preference" }]);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    const invalid = passengers.some((p) => !p.name.trim() || !p.age);
    if (invalid) return;

    setBookingStep("seating");
  };

  const toggleSeat = (seatNo) => {
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= passengers.length) {
        setSelectedSeats((prev) => [...prev.slice(1), seatNo]);
      } else {
        setSelectedSeats((prev) => [...prev, seatNo]);
      }
    }
  };

  const handleSeatConfirm = () => {
    if (selectedSeats.length === 0) return;
    setBookingStep("checkout");
  };

  const handlePayment = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const coach = ["A1", "B1", "H1", "S1"][Math.floor(Math.random() * 4)];
      
      const ticketData = {
        pnr,
        trainName: selectedTrain.name,
        trainNumber: selectedTrain.number,
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.date,
        depTime: selectedTrain.dep,
        arrTime: selectedTrain.arr,
        duration: selectedTrain.dur,
        className: selectedClass.code,
        price: selectedClass.price * passengers.length,
        coach,
        seats: selectedSeats.join(", "),
        passengers: passengers.map((p, index) => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          seat: selectedSeats[index] ? `${coach}/${selectedSeats[index]}` : `${coach}/${12 + index}`
        }))
      };

      setGeneratedTicket(ticketData);
      
      // Save to global context bookings
      addBooking(
        `${selectedTrain.name} (${selectedClass.code})`,
        searchParams.date,
        `Coach ${coach}, Seat ${selectedSeats.join(", ")}`
      );
      
      setBookingStep("ticket");
    }, 2000);
  };

  const resetBooking = () => {
    setBookingStep("search");
    setHasSearched(false);
    setSelectedTrain(null);
    setSelectedClass(null);
    setPassengers([{ name: "", age: "", gender: "Male", berth: "No Preference" }]);
    setSelectedSeats([]);
    setGeneratedTicket(null);
  };

  return (
    <div className="ticket-system-container">
      {/* Step Header Timeline */}
      <div className="booking-timeline">
        <div className={`timeline-node ${bookingStep === "search" ? "active" : ""}`}>Search Trains</div>
        <div className={`timeline-node ${bookingStep === "passengers" ? "active" : ""}`}>Add Passengers</div>
        <div className={`timeline-node ${bookingStep === "seating" ? "active" : ""}`}>Berths Selection</div>
        <div className={`timeline-node ${bookingStep === "checkout" ? "active" : ""}`}>Payment Gate</div>
        <div className={`timeline-node ${bookingStep === "ticket" ? "active" : ""}`}>E-Ticket</div>
      </div>

      {bookingStep === "search" && (
        <div className="search-phase">
          <form onSubmit={handleSearch} className="ticket-search-form">
            <div className="search-grid">
              <div className="search-col">
                <label>Origin Station</label>
                <select name="from" value={searchParams.from} onChange={handleSearchChange}>
                  <option value="New Delhi (NDLS)">New Delhi (NDLS)</option>
                  <option value="Mumbai Central (MMCT)">Mumbai Central (MMCT)</option>
                  <option value="KSR Bengaluru (SBC)">KSR Bengaluru (SBC)</option>
                  <option value="Howrah Junction (HWH)">Howrah Junction (HWH)</option>
                </select>
              </div>
              <div className="search-col">
                <label>Destination City</label>
                <select name="to" value={searchParams.to} onChange={handleSearchChange}>
                  <option value="Goa">Goa</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Manali">Manali</option>
                  <option value="Udaipur">Udaipur</option>
                </select>
              </div>
              <div className="search-col">
                <label>Journey Date</label>
                <input
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleSearchChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
            <button type="submit" className="search-trains-btn">Search Direct Trains (IRCTC)</button>
          </form>

          {hasSearched && (
            <div className="trains-results-list">
              <h4>Available Direct Trains to {searchParams.to}</h4>
              {activeTrains.map((train) => (
                <div key={train.id} className="train-row-card">
                  <div className="train-time-info">
                    <div className="train-identity">
                      <h5>{train.name}</h5>
                      <span className="train-no">#{train.number}</span>
                    </div>
                    <div className="time-dur-block">
                      <div className="time-time">
                        <strong>{train.dep}</strong>
                        <span className="station">{searchParams.from.split(" ")[0]}</span>
                      </div>
                      <div className="dur-arrow">
                        <span className="dur-text">{train.dur}</span>
                        <div className="arrow-line"></div>
                      </div>
                      <div className="time-time">
                        <strong>{train.arr}</strong>
                        <span className="station">{searchParams.to}</span>
                      </div>
                    </div>
                  </div>

                  <div className="availability-grid">
                    {Object.keys(train.classes).map((clsKey) => {
                      const c = train.classes[clsKey];
                      const isAvail = c.avail > 0;
                      return (
                        <div
                          key={clsKey}
                          className={`avail-card ${isAvail ? "green-avail" : "red-wait"} ${selectedTrain?.id === train.id && selectedClass?.code === c.code ? "selected" : ""}`}
                          onClick={() => selectTrainClass(train, clsKey)}
                        >
                          <div className="class-code">{clsKey}</div>
                          <div className="avail-status">
                            {isAvail ? `AV-${c.avail}` : "WL-12"}
                          </div>
                          <div className="price-tag">₹{c.price}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {bookingStep === "passengers" && (
        <div className="passengers-phase">
          <div className="selected-connection-banner">
            <span><strong>Train:</strong> {selectedTrain.name} (#{selectedTrain.number})</span>
            <span><strong>Class Selected:</strong> {selectedClass.code}</span>
            <span><strong>Journey Date:</strong> {searchParams.date}</span>
          </div>

          <form onSubmit={handlePassengerSubmit} className="passenger-entry-form">
            <h3>Passenger Registration (IRCTC Gateway)</h3>
            <p className="subtitle-info">Please input accurate details matching government ID documents.</p>

            {passengers.map((p, idx) => (
              <div key={idx} className="passenger-row">
                <span className="row-no">{idx + 1}</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={p.name}
                  onChange={(e) => updatePassenger(idx, "name", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Age"
                  min="1"
                  max="120"
                  value={p.age}
                  onChange={(e) => updatePassenger(idx, "age", e.target.value)}
                  required
                />
                <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select value={p.berth} onChange={(e) => updatePassenger(idx, "berth", e.target.value)}>
                  <option value="No Preference">No Preference</option>
                  <option value="Lower">Lower Berth</option>
                  <option value="Middle">Middle Berth</option>
                  <option value="Upper">Upper Berth</option>
                  <option value="Side Lower">Side Lower</option>
                  <option value="Side Upper">Side Upper</option>
                </select>
                {passengers.length > 1 && (
                  <button type="button" className="remove-passenger-btn" onClick={() => removePassenger(idx)}>
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div className="passenger-actions">
              <button type="button" className="add-passenger-btn" onClick={addPassenger}>
                + Add Passenger
              </button>
              <div className="navigation-actions">
                <button type="button" className="back-btn" onClick={() => setBookingStep("search")}>Back</button>
                <button type="submit" className="confirm-passengers-btn">Confirm Passengers</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {bookingStep === "seating" && (
        <div className="seating-phase">
          <h3>Visual Berth / Seat Allocation</h3>
          <p className="subtitle-info">Select {passengers.length} preferred berth(s) on the real-time Indian Railways Coach grid.</p>

          <div className="seating-layout-grid">
            <div className="coach-aisle-map">
              <div className="cabin-side">
                <div className="seat-label">Lower Berth (LB)</div>
                <div className="berths-row">
                  {[1, 4, 7, 10, 13, 16].map((num) => (
                    <div
                      key={num}
                      className={`seat-box ${selectedSeats.includes(num) ? "selected" : ""}`}
                      onClick={() => toggleSeat(num)}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="seat-label">Middle Berth (MB)</div>
                <div className="berths-row">
                  {[2, 5, 8, 11, 14, 17].map((num) => (
                    <div
                      key={num}
                      className={`seat-box ${selectedSeats.includes(num) ? "selected" : ""}`}
                      onClick={() => toggleSeat(num)}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="coach-aisle">Coach Walkway</div>

              <div className="cabin-side">
                <div className="seat-label">Upper Berth (UB)</div>
                <div className="berths-row">
                  {[3, 6, 9, 12, 15, 18].map((num) => (
                    <div
                      key={num}
                      className={`seat-box ${selectedSeats.includes(num) ? "selected" : ""}`}
                      onClick={() => toggleSeat(num)}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="seating-legend">
            <div className="legend-item"><span className="indicator vacant"></span>Vacant Berth</div>
            <div className="legend-item"><span className="indicator chosen"></span>Your Berth</div>
          </div>

          <div className="passenger-actions">
            <button type="button" className="back-btn" onClick={() => setBookingStep("passengers")}>Back</button>
            <button
              type="button"
              className="confirm-seating-btn"
              disabled={selectedSeats.length !== passengers.length}
              onClick={handleSeatConfirm}
            >
              Selected: {selectedSeats.length} / {passengers.length} (Confirm Allocation)
            </button>
          </div>
        </div>
      )}

      {bookingStep === "checkout" && (
        <div className="checkout-phase">
          <h3>Verify details & IRCTC Payment Gate</h3>
          <p className="subtitle-info">Review reservations before processing secure bank transaction payment.</p>

          <div className="summary-payment-card">
            <div className="summary-details">
              <h5>Indian Railways Booking Summary</h5>
              <p><strong>Train:</strong> {selectedTrain.name} (#{selectedTrain.number})</p>
              <p><strong>Journey Route:</strong> {searchParams.from} to {searchParams.to}</p>
              <p><strong>Departure Date:</strong> {searchParams.date} at {selectedTrain.dep}</p>
              <p><strong>Allocated Berths:</strong> Coach {selectedSeats.map(s => `Seat ${s}`).join(", ")}</p>
              <p><strong>Passengers:</strong> {passengers.map(p => `${p.name} (${p.age}, ${p.gender})`).join(", ")}</p>
            </div>
            
            <div className="total-pricing-block">
              <span className="price-label">Aggregate Rupee Fare (INR)</span>
              <span className="price-value">₹{selectedClass.price * passengers.length}</span>
              <span className="tax-info">Includes IRCTC catering charge, superfast surcharge & service tax</span>
            </div>
          </div>

          <div className="passenger-actions">
            <button type="button" className="back-btn" disabled={checkoutLoading} onClick={() => setBookingStep("seating")}>
              Back
            </button>
            <button type="button" className="pay-btn" disabled={checkoutLoading} onClick={handlePayment}>
              {checkoutLoading ? "Authorizing Secure IRCTC Gateway..." : `Proceed to Secure Pay ₹${selectedClass.price * passengers.length}`}
            </button>
          </div>
        </div>
      )}

      {bookingStep === "ticket" && generatedTicket && (
        <div className="ticket-phase">
          <div className="ticket-success-message">
            <h4>✓ IRCTC E-Ticket Issued Successfully</h4>
            <p>Your electronic boarding receipt is detailed below. A copy has been saved under your profile transit bookings.</p>
          </div>

          {/* Authentic IRCTC styled E-Ticket */}
          <div className="e-ticket-receipt">
            <div className="receipt-banner" style={{ backgroundColor: "#003b95" }}>
              <div className="receipt-brand">IRCTC - TravelAI Partner Ticket</div>
              <div className="pnr-block">
                <span className="pnr-lbl">PNR NUMBER</span>
                <span className="pnr-val" style={{ letterSpacing: "1px" }}>{generatedTicket.pnr}</span>
              </div>
            </div>

            <div className="receipt-body">
              <div className="receipt-train-row">
                <div className="train-no-name">
                  <strong>{generatedTicket.trainName}</strong>
                  <span>Train No: #{generatedTicket.trainNumber}</span>
                </div>
                <div className="class-badge-box" style={{ backgroundColor: "#003b95", color: "white" }}>
                  Class: {generatedTicket.className}
                </div>
              </div>

              <div className="receipt-route-grid">
                <div className="route-node">
                  <span className="node-time">{generatedTicket.depTime}</span>
                  <span className="node-station">{generatedTicket.from}</span>
                  <span className="node-date">{generatedTicket.date}</span>
                </div>
                <div className="route-duration">
                  <span className="dur-text">{generatedTicket.duration}</span>
                  <div className="arrow-line"></div>
                </div>
                <div className="route-node text-right">
                  <span className="node-time">{generatedTicket.arrTime}</span>
                  <span className="node-station">{generatedTicket.to}</span>
                  <span className="node-date">{generatedTicket.date}</span>
                </div>
              </div>

              <div className="receipt-passengers-table">
                <div className="table-header">
                  <span>Passenger Name</span>
                  <span>Age/Sex</span>
                  <span>Berth / Coach Allocation</span>
                </div>
                {generatedTicket.passengers.map((p, idx) => (
                  <div key={idx} className="table-row">
                    <span className="name">{p.name}</span>
                    <span>{p.age} / {p.gender[0]}</span>
                    <span className="allocated">Coach {generatedTicket.coach} / Berth {p.seat.split("/")[1]}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-footer">
                <div className="pricing-receipt">
                  <span>Transaction Status: <strong style={{ color: "#28a745" }}>SUCCESS</strong></span>
                  <span>Total Paid: <strong style={{ color: "#003b95" }}>₹{generatedTicket.price}</strong></span>
                </div>
                <div className="barcode-simulation">
                  <div className="barcode-stripes"></div>
                  <span className="barcode-text">PNR-{generatedTicket.pnr}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="post-ticket-actions">
            <button className="book-another-btn" onClick={resetBooking} style={{ backgroundColor: "#003b95" }}>
              Book Another Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
