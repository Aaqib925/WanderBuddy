import React, { useState } from "react";
import "./style.css";
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  process.env.NEXT_PUBLIC_MC_TRANSACTION_API_KEY
);

const SendItinerary = ({
  setShowSendItinerary,
  onSent,
  days,
  city,
  daysNum,
}) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);

  const sendMessage = async () => {
    if (sending) {
      return;
    }
    setSending(true);

    let _days = days;

    if (_days.length > 1) {
      _days.shift();
    } else {
      _days[0] = "1" + _days[0];
    }

    console.log(_days[0]);

    let html = `<h3>Here is your RoamAround itinerary for ${city} for ${daysNum} days</h3><br>`;
    _days.forEach((day) => {
      html += `<div style="margin-bottom:30px">Day ${day}</div>`;
    });


    const message = {
      from_email: "Itineraries@RoamAround.io",
      subject: "Your RoamAround Itinerary",
      html: html,
      to: [
        {
          email: email,
          type: "to",
        },
      ],
    };

    async function run() {
      try {
        await mailchimp.messages.send({
          message,
        });
        setSending(false);
        onSent();
        setShowSendItinerary(false);
      } catch (e) {
        console.log("e:", e);
        setSending(false);
      }
    }
    run();
  };
  const validateEmail = (e) => {
    setEmail(e.target.value);
    const localEmail = e.target.value;
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (pattern.test(localEmail)) {
      setEmailError(false);
    } else {
      setEmailError(true);
    }
  };

  return (
    <div id="popup1" className="overlay">
      <div className="popup">
        <h2>Enter your email to get the itinerary emailed to you.</h2>
        <a
          className="close"
          onClick={() => {
            setShowSendItinerary(false);
          }}
        >
          &times;
        </a>
        <div className="sendItineraryWrapper"></div>

        <input
          className="sendItineraryInput"
          onChange={(e) => validateEmail(e)}
          type="email"
          value={email}
          placeholder="your@email.com"
        />

        <button
          className="input-button sendItineraryButton"
          disabled={emailError || sending}
          onClick={sendMessage}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default SendItinerary;
