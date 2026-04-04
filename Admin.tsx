import React, { useEffect, useState } from "react";

function Admin() {
  const [bookings, setBookings] = useState([]);
  const [markup, setMarkup] = useState(500);
  const [fee, setFee] = useState(200);
  const [discount, setDiscount] = useState(0);

  const [couponCode, setCouponCode] = useState("");
  const [couponValue, setCouponValue] = useState(0);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("bookings")) || [];
    setBookings(data);

    const savedCoupons = JSON.parse(localStorage.getItem("coupons")) || [];
    setCoupons(savedCoupons);
  }, []);

  const savePricing = () => {
    localStorage.setItem(
      "pricing",
      JSON.stringify({ markup, fee, discount })
    );
    alert("Pricing Saved ✅");
  };

  const addCoupon = () => {
    const newCoupons = [...coupons, { code: couponCode, value: couponValue }];
    setCoupons(newCoupons);
    localStorage.setItem("coupons", JSON.stringify(newCoupons));
    setCouponCode("");
    setCouponValue(0);
  };

  const deleteCoupon = (code) => {
    const updated = coupons.filter((c) => c.code !== code);
    setCoupons(updated);
    localStorage.setItem("coupons", JSON.stringify(updated));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel 🧑‍💼</h1>

      <h2>Pricing Settings</h2>
      <input value={markup} onChange={(e) => setMarkup(e.target.value)} placeholder="Markup" />
      <input value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Fee" />
      <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount" />
      <button onClick={savePricing}>Save Pricing</button>

      <h2>Coupons 🎟️</h2>
      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Code" />
      <input value={couponValue} onChange={(e) => setCouponValue(e.target.value)} placeholder="Discount ₹" />
      <button onClick={addCoupon}>Add Coupon</button>

      {coupons.map((c, i) => (
        <div key={i}>
          {c.code} - ₹{c.value}
          <button onClick={() => deleteCoupon(c.code)}>Delete</button>
        </div>
      ))}

      <h2>All Bookings</h2>
      {bookings.map((b, i) => (
        <div key={i} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <p>{b.name} | {b.flight} | ₹{b.price}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;