import { Badge, Loader } from "@mantine/core";
import classes from "./landlord-dashboard-style.module.css";
import { useAdStats, useLandlordAds } from "./landlord-dashboard-queries.jsx";
import { Link, useNavigate } from "react-router-dom";
import DashboardFiltersSection from "./landlord-dashboard-filters-section.jsx";

export const LandlordDashboardPage = () => {
  const navigate = useNavigate();
  const handleNewMessagesClick = () => {
    navigate("/mymessages");
  };

  const handleCreateAdClick = () => {
    navigate("/property/new");
  };

  const { data: adStats, isLoading } = useAdStats();
  const searchQuery = useLandlordAds();

  return (
    <>
      <div className={classes.container}>
        <DashboardFiltersSection />
        <div className={classes.mainContent}>
          <div className={classes.dashboardSummary}>
            <div className={classes.summaryHeader}>
              <h2>Welcome to Dashboard!</h2>
              <p>Your Ad details:</p>
            </div>
            <div className={classes.metricsGrid}>
              <div className={classes.metricCard}>
                <h4>Ads Created</h4>
                <p>{isLoading ? <Loader size="sm" color="blue" /> : adStats?.allAds || 0}</p>
              </div>
              <div className={classes.metricCard}>
                <h4>Ads Active</h4>
                <p>{isLoading ? <Loader size="sm" color="blue" /> : adStats?.activeAds || 0}</p>
              </div>
              <div className={classes.metricCard}>
                <h4>New Requests</h4>
                <p>0</p>
              </div>
            </div>
            <div className={classes.actionButtons}>
              <button onClick={handleCreateAdClick}>Create New Listing</button>
              <button>Documents</button>
              <button onClick={handleNewMessagesClick}>
                New Messages {/*<span className={classes.badge}>6</span>*/}
              </button>
            </div>
          </div>

          <div className={classes.container}>
            <div className={classes.resultsSection}>
              {searchQuery.isLoading && <p>Loading...</p>}
              {searchQuery.error && <p>Error: {searchQuery.error.message}</p>}

              {searchQuery.data &&
                searchQuery.data.map((property) => {
                  if (!property) return null;
                  return (
                    <div key={property.id} className={classes.propertyCard}>
                      {property.media ? (
                        <img src={property.media} alt={property.title} />
                      ) : (
                        <div>No Image Available</div>
                      )}

                      <div className={classes.propertyCardContent}>
                        <div className={classes.cardHeader}>
                          <h2>{property.title}</h2>
                          <Badge
                            color={
                              property.status === "ACTIVE"
                                ? "green"
                                : property.status === "PENDING"
                                ? "yellow"
                                : property.status === "DRAFT"
                                ? "gray"
                                : "red" /* For REJECTED */
                            }
                            className={classes.statusBadge}
                          >
                            {property.status}
                          </Badge>
                        </div>
                        <div className={classes.propertyCardTags}>
                          <span>€ {property.totalRent}</span>
                          {property.petsAllowed && <span>Pets Allowed</span>}
                          {property.smokingAllowed && <span>Smoking Allowed</span>}
                        </div>
                        <p>{property.description.slice(0, 50)}...</p>
                        <Link
                          to={`/property/${property.id}`}
                          style={{
                            display: "inline-block",
                            backgroundColor: "#d4f8d4",
                            color: "#000000",
                            padding: "0.5rem 1rem",
                            borderRadius: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            transition: "background-color 0.3s ease, color 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#c2edc2"; /* Hover effect */
                            e.target.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#d4f8d4"; /* Reset to original */
                            e.target.style.color = "#000000";
                          }}
                        >
                          Edit →
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
