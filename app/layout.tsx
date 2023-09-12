import "./globals.css";
import { AnalyticsWrapper } from "./components/analytics";
import MailchimpFormContainer from "./components/MailchimpForm/MailChimpFormContainer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body style={{ position: "relative" }}>
        <div className="wrapper">
          {children}
          <AnalyticsWrapper />
        </div>

        <footer>
          <div className="mailChimpWrapper">
            <MailchimpFormContainer />
          </div>
          <div className="footer">
            <p>
            <a 
            className="sponsor"
             target="_blank" 
             rel="no-opener" 
             href="mailto:shie@roamaround.io?subject=RoamAround Feedback"> {" "} I'm in BETA. I'd love your feedback 🫡 </a>           
              </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
