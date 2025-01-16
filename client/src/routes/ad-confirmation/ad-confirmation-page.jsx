import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mantine/core";
import classes from "./ad-confirmation-style.module.css";

export const AdConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const propertyId = location.state?.propertyId || null;

  const handleMessagesClick = () => {
    navigate("/mymessages");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const handleEditAdClick = () => {
    if (propertyId) {
      navigate(`/property/${propertyId}/edit`);
    }
  };

  return (
    <div className={classes.confirmationContainer}>
      <div className={classes.confirmationBox}>
        <h2>Your ad request has been sent!</h2>
        <p>
          We&apos;ll verify the documents and let you know shortly. The admin
          will review your files and documents and verify them accordingly. If
          everything turns out great, your ad will be published shortly. You
          will receive a notification within 1-2 business days.
        </p>
        <div className={classes.actionButtons}>
          <Button color="green" onClick={handleMessagesClick}>
            Messages
          </Button>
          <Button color="blue" onClick={handleDashboardClick}>
            Dashboard
          </Button>
          <Button color="yellow" onClick={handleEditAdClick}>
            Edit Ad
          </Button>
        </div>
      </div>
    </div>
  );
};
