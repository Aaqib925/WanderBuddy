"use client";

import React, { useState, useEffect, useReducer, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { data } from "../city-data";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AFFILIATE_URL } from "@/constants";
import Script from "next/script";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import SendItinerary from "./components/SendItinerary";
import kayakDomains from "@/configs/kayak-domains";
/*import {TwitterIcon, TwitterShareButton} from "react-share";*/

export default function Home() {
  const [request, setRequest] = useState<{
    startDate?: string;
    daysNum?: number;
    city?: string;
    pointOfInterest?: Array<string>;
    itinerary?: string;
  }>({});
  const [disableButton, setDisableButton] = useState<boolean>(true);
  const [error, setError] = useState<{ daysNum: boolean }>({ daysNum: false });
  let [itinerary, setItinerary] = useState<string>("");
  let [itineraryHtml, setItineraryHtml] = useState<string>("");
  const [userGeo, setUserGeo] = useState({ city: '', region: '', country: '' })
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const currentCity = useRef<string>("");
  const [showSendItinerary, setShowSendItinerary] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const itineraryCollectionRef = collection(db, "itinerary");
  const createItinerary = async () => {
    await addDoc(itineraryCollectionRef, {
      city: request.city,
      date: request.startDate,
      daysNumber: request.daysNum,
      itinerary: itinerary,
      pointsOfInterest: request.pointOfInterest,
    });
  };

  useEffect(() => {
    if (request.itinerary) {
      createItinerary();
    }
  }, [request.itinerary]);
  useEffect(() => {
    checkRedirect();
    getGeoInfo();
  }, []);
  const getGeoInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/8.8.8.8/json/', {
        method: 'get',
      })
      const data = await response.json();
      setUserGeo({ city: data.city, region: data.region, country: data.country_name?.toLowerCase() })
    }
    catch (err) {
      console.log(err)
    }
  };

  useEffect(() => {
    if (request.daysNum && request.daysNum > 10) {
      setError((error) => ({
        ...error,
        daysNum: true,
      }));
    } else {
      setError((error) => ({
        ...error,
        daysNum: false,
      }));
    }

    if (
      request.city &&
      request.daysNum &&
      request.startDate &&
      request.daysNum <= 10
    ) {
      if (currentCity.current === request.city) {
        setDisableButton(true);
      } else {
        ("");
        setDisableButton(false);
      }
    }
    if (
      request.city == "" ||
      request.daysNum == 0 ||
      request.startDate == "" ||
      (request.daysNum && request.daysNum > 10) ||
      currentCity.current === request.city
    ) {
      setDisableButton(true);
    }
  }, [request, currentCity.current]);

  function checkRedirect() {
    if (window.location.hostname === "gpt-travel-advisor.vercel.app") {
      window.location.replace("https://www.roamaround.io/");
    }
  }

  const redirectToFlights = async () => {
    if (request.startDate && request.daysNum && request.city) {
      const origin = await getAirportIataCode(userGeo.city, userGeo.region);
      const destination = await getAirportIataCode(request.city, '');
      const departureDate = formatDate(new Date(request.startDate))
      const returnDate = formatDate(addDays(new Date(departureDate), request.daysNum))
      let kayakDomain = kayakDomains[userGeo.country]
      if (!kayakDomain) {
        kayakDomain = 'www.kayak.com';
      }
      const url = `https://${kayakDomain}/in?a=kan_252244_562880&url=/flights/${origin}-${destination}/${departureDate}/${returnDate}?sort=bestflight_a`
      window.open(url, '_blank', 'noreferrer');
    }

  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString()
    const day = date.getDate().toString()
    return year + "-" + (month.length != 2 ? "0" + month : month) + "-" + (day.length != 2 ? "0" + day : day);
  }

  const getAirportIataCode = async (city: string, region: string) => {
    const cityResponse = await fetch(`https://www.kayak.com/mvm/smartyv2/search?f=j&s=airportonly&where=${city}`)
    const cityAirports = await cityResponse.json();
    if (cityAirports[0]?.id) {
      return cityAirports[0]?.id
    }
    const regionResponse = await fetch(`https://www.kayak.com/mvm/smartyv2/search?f=j&s=airportonly&where=${region}`)
    const regionAirports = await regionResponse.json();
    return regionAirports[0]?.id

  }

  const addDays = (date: Date, days: number) => {
    return new Date(date.setDate(date.getDate() + days));
  }

  const isDateValid = (date: Date) => {
    return date.getTime() === date.getTime();
  };
  async function hitAPI() {
    gtag("event", "itinerary_btn_clk", {
      city: request.city,
      number_of_days: request.daysNum,
    });

    setEmailSent(false);

    try {
      if (
        !request.city ||
        !request.startDate ||
        !isDateValid(new Date(request.startDate)) ||
        !request.daysNum
      )
        return;

      //setMessage('Hi! We hit our limits at the moment. Please come back tomorrow!')
      currentCity.current = request.city;
      setMessage("Building itinerary...");
      setDisableButton(true);
      setLoading(true);
      setItinerary("");

      setTimeout(() => {
        if (!loading) return;
        setMessage("Getting closer ...");
      }, 2000);
      setTimeout(() => {
        if (!loading) return;
        setMessage("Almost there ...");
      }, 15000);
      const response = await fetch("/api/get-itinerary", {
        method: "POST",
        body: JSON.stringify({
          days: request.daysNum,
          city: request.city,
          startDate: request.startDate,
        }),
      });
      const json = await response.json();
      const response2 = await fetch("/api/get-points-of-interest", {
        method: "POST",
        body: JSON.stringify({
          pointsOfInterestPrompt: json.pointsOfInterestPrompt,
        }),
      });
      const json2 = await response2.json();
      let pointsOfInterest = JSON.parse(json2.pointsOfInterest);
      setRequest((request) => ({
        ...request,
        pointOfInterest: JSON.parse(json2.pointsOfInterest),
      }));
      let itinerary = json.itinerary;
      itinerary = itinerary.replaceAll("Morning", "\n**Morning**");
      itinerary = itinerary.replaceAll("Evening", "\n**Evening**");
      itinerary = itinerary.replaceAll("Afternoon", "\n**Afternoon**");
      let itineraryHtml = json.itinerary;
      pointsOfInterest.map((point) => {
        itineraryHtml = itineraryHtml.replace(
          point,
          `<a href="https://www.viator.com/searchResults/all?pid=P00089289&mcid=42383&medium=link&text=${encodeURIComponent(
            point + " " + request.city
          )})">${point}</a>`
        );
        itinerary = itinerary.replace(
          point,
          `[${point}](https://www.viator.com/searchResults/all?pid=P00089289&mcid=42383&medium=link&text=${encodeURIComponent(
            point + " " + request.city
          )})`
        );
      });

      setItinerary(itinerary);
      setItineraryHtml(itineraryHtml);
      setRequest((request) => ({
        ...request,
        itinerary: json.itinerary,
      }));

      if (currentCity.current === request.city) {
        setDisableButton(true);
      } else {
        setDisableButton(false);
      }
      setLoading(false);
    } catch (err) {
      console.log("error: ", err);

      if (currentCity.current === request.city) {
        setDisableButton(true);
      } else {
        setDisableButton(false);
      }

      setLoading(true);
      setMessage("Can not build itinerary ");
      setTimeout(() => {
        setLoading(false);
        setMessage(" ");
      }, 5000);
    }
  }

  let days = itinerary.split("\n\nDay");


  if (days.length > 1) {
    days.shift();
  } else {
    days[0] = "1" + days[0];
  }

  return (
    <>
      <main>
        <div className="app-container">
          {showSendItinerary && (
            <SendItinerary
              onSent={() => {
                setEmailSent(true);
              }}
              daysNum={request.daysNum}
              city={request.city}
              days={itineraryHtml.split("\n\nDay")}
              setShowSendItinerary={setShowSendItinerary}
            />
          )}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-FN5ZTL4VE8"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-FN5ZTL4VE8');
        `}
          </Script>
          <h1 style={styles.header} className="hero-header">
            Roam Around
          </h1>
          <div style={styles.formContainer} className="form-container">
            {/*} <TwitterShareButton
                style={{position: 'absolute', top:-44, right: 0}}
                url={'https://RoamAround.io'}
                title={'Someone built a travel planner using ChatGPT @RoamAround_io\n\n' +
                    'Enter your destination and the number of days, and it gives you an itinerary complete with links to book experiences and flights.\n\n' +
                    'Check it out:'}
            >
              <TwitterIcon size={38} round/>
            </TwitterShareButton>*/}
            <input
              style={styles.input}
              placeholder="Destination"
              onChange={(e) => {
                setRequest((request) => ({
                  ...request,
                  city: e.target.value,
                }));
              }}
            />
            <div style={{ zIndex: showSendItinerary ? -1 : 1 }}>
              <DatePicker
                placeholderText={"Start Date"}
                minDate={new Date()}
                selected={request.startDate}
                onChange={(date) => {
                  setRequest((request) => ({
                    ...request,
                    startDate: date,
                  }));
                }}
              />
            </div>

            <input
              type="number"
              min="1"
              max="10"
              onKeyDown={(e) => {
                if (e.key == "-" || (e.key == "0" && !request.daysNum)) {
                  e.preventDefault();
                }
              }}
              style={styles.input}
              placeholder="# of Days"
              onChange={(e) => {
                if (Number.parseInt(e.target.value) <= 0) {
                  e.preventDefault();
                  setRequest((request) => ({
                    ...request,
                    daysNum: undefined,
                  }));
                  return;
                }
                setRequest((request) => ({
                  ...request,
                  daysNum: Number(e.target.value),
                }));
              }}
            />
            {/*<button*/}
            {/*    className="input-button"*/}
            {/*    disabled={!request.city || !isDateValid(new Date(request?.startDate || '')) || !request.daysNum}*/}
            {/*    onClick={redirectToFlights}*/}
            {/*>*/}
            {/*  Recommend me flights*/}
            {/*</button>*/}
            {error.daysNum && (
              <p style={styles.daysError}>
                At the moment we can only build itineraries for trips 10 days or
                less
              </p>
            )}
            <button
              className="input-button"
              disabled={disableButton}
              onClick={hitAPI}
            >
              Build Itinerary
            </button>
          </div>
          <div className="results-container">
            {loading && <p>{message}</p>}



            {itinerary && (
              <h3 style={styles.cityHeadingStyle}>
                The first step to roaming around {" "} {checkCity(request.city)} is {" "}
                <a
                  className="cursor-pointer"
                  onClick={() => redirectToFlights()}
                >
                  booking flights.
                </a> Once you arrive, your itinerary is as follows:  <br></br>
                <br></br>

              </h3>

            )}


            {itinerary &&
              days.map((day, index) => (
                <div style={{ marginBottom: "30px" }} key={index}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: (props) => {
                        return (
                          <a target="_blank" rel="no-opener" href={props.href}>
                            {props.children}
                          </a>
                        );
                      },
                    }}
                  >
                    {`Day ${day}`}
                  </ReactMarkdown>
                </div>
              ))}
            {/* { <h1 onClick={()=>setShowSendItinerary(true)}>Click me</h1>} */}

            {itinerary && (
              <>
                <h3 style={styles.cityHeadingStyle}>
                  Ready to roam around? {" "}
                  <a
                    className="cursor-pointer"
                    onClick={() => redirectToFlights()}
                  >
                    Book flights to {" "}
                    {checkCity(request.city)}!
                  </a>

                </h3>
              </>
            )}
            {itinerary && (
              <>
                <br></br>
                {emailSent ? (
                  <h3 style={styles.cityHeadingStyle}>
                    Success! Itinerary sent to your email.
                  </h3>
                ) : (
                  <h3 style={styles.cityHeadingStyle}>
                    {" "}
                    To get this itinerary emailed to you, click{" "}
                    <a
                      className="cursor-pointer"
                      onClick={() => setShowSendItinerary(true)}
                    >
                      here.
                    </a>
                  </h3>
                )

                }

              </>
            )}


            {/*{
            itinerary && (
              <h3 style={styles.cityHeadingStyle}> Ready to take the next step? Support us by booking <a target="_blank" rel="no-opener" href="https://bit.ly/roamaroundfoot">here</a></h3>
            )
          }*/}
          </div>
        </div>
      </main>
    </>
  );
}

function checkCity(city?: string) {
  if (!city) return;
  const cityToLowerCase = city.toLowerCase();
  const cityData = data[cityToLowerCase];
  if (cityData) {
    const link = data[cityToLowerCase].link;
    return (
      <a target="_blank" rel="no-referrer" href={link}>
        {cityToLowerCase.charAt(0).toUpperCase() + cityToLowerCase.slice(1)}
      </a>
    );
  } else {
    return cityToLowerCase.charAt(0).toUpperCase() + cityToLowerCase.slice(1);
  }
}

const styles = {
  cityHeadingStyle: {
    color: "white",
    marginBottom: "20px",
  },
  header: {
    textAlign: "center" as "center",
    marginTop: "60px",
    color: "#c683ff",
    fontWeight: "900",
    fontFamily: "Poppins",
    fontSize: "68px",
  },
  daysError: {
    color: "red",
    fontSize: "11px",
    margin: "5px 0",
  },
  input: {
    padding: "10px 14px",
    marginBottom: "4px",
    outline: "none",
    fontSize: "16px",
    width: "100%",
    borderRadius: "8px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    margin: "20px auto 0px",
    padding: "20px",
    boxShadow: "0px 0px 12px rgba(198, 131, 255, .2)",
    borderRadius: "10px",
  },
  result: {
    color: "white",
  },
};