'use client';
import React from 'react';
import './formStyles.css';
import MailchimpSubscribe from 'react-mailchimp-subscribe';
import { CustomForm } from './customForm';

const MailchimpFormContainer = () => {
  const postUrl = `${process.env.NEXT_PUBLIC_MC_POST_LINK}?u=${process.env.NEXT_PUBLIC_MC_U_ID}&id=${process.env.NEXT_PUBLIC_MC_ID}`;

  return (
    <div className="mc__form-container">
      <MailchimpSubscribe
        url={postUrl}
        render={({ subscribe, status, message }) => (
          <CustomForm
            status={status}
            message={message}
            onValidated={(formData) => subscribe(formData)}
          />
        )}
      />
    </div>
  );
};

export default MailchimpFormContainer;
