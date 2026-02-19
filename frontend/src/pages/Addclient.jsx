import { useState } from "react";
import API from "../service/api.js";

function AddClient() {
  const [formData, setFormData] = useState({
    fullName: "",
    passportNumber: "",
    nationality: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/clients", formData);
      setMessage("Client added successfully ✅");
      setFormData({
        fullName: "",
        passportNumber: "",
        nationality: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      setMessage("Error adding client ❌");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Add New Client</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="passportNumber"
          placeholder="Passport Number"
          value={formData.passportNumber}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="nationality"
          placeholder="Nationality"
          value={formData.nationality}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />

        <button type="submit">Add Client</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
};

export default AddClient;
