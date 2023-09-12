"use client";

import React, { useState, useEffect } from "react";
import ArrowButton from "@/public/arrowButton.png";
import "./formStyles.css";

export const CustomForm = ({ status, message, onValidated }) => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(true);
  const [showButton, setShowButton] = useState(true);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    gtag("event", "email_submit_clk", { email: email });
    e.preventDefault();
    email &&
      email.indexOf("@") > -1 &&
      onValidated({
        EMAIL: email,
      });
  };

  useEffect(() => {
    if (status === "success") clearFields();
  }, [status]);

  const clearFields = () => {
    setEmail("");
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
    <form
      className="mc__form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}
    >
      <h5 className="mc__title">
        {/* {status === "success"
          ? "Success!"
          : "Subscribe for exclusive RoamAround deals:"} */}
      </h5>
      <div className="form-container formContainer">
        {status !== "success" ? (
          showButton ? (
            <div
              className="mc__field-container"
              onClick={() => {
                setShowButton(false);
              }}
            >
              <p className="initialButton">
                Subscribe for exclusive RoamAround deals
              </p>
            </div>
          ) : (
            <div className="mc__field-container">
              <input
                onChange={(e) => validateEmail(e)}
                type="email"
                style={styles.inputStyles}
                value={email}
                placeholder="enter email address"
              />

              <button
                className="input-button-main submitBtn"
                type="submit"
                disabled={emailError}
              >
                <img src={ArrowButton.src} style={styles.submitButtonIcon} />
              </button>
            </div>
          )
        ) : null}
        {email && emailError && (
          <p className="errorMessage" style={styles.messages}>
            Please Enter valid Email
          </p>
        )}
        {status === "sending" && (
          <div className="successMessage" style={styles.messages}>
            sending...
          </div>
        )}
        {status === "error" && (
          <div
            className="errorMessage2"
            style={styles.messages}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
        {status === "success" && (
          <div
            className="successMessage"
            style={styles.messages}
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
      </div>
    </form>
  );
};
const styles = {
  messages: {
    fontSize: "11px",
  },
  submitButtonIcon: {
    width: "30px",
  },
  inputStyles: {
    backgroundColor: "transparent",
    border: "none",
    color: "#c683ff",
  },
};