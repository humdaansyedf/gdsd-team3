import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Select, NumberInput, SimpleGrid, Switch, Badge } from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./landlord-dashboard-style.module.css";
import { CreateAdModal } from "../create-ad/create-ad-page.jsx";

export const LandlordDashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const hardcodedNewRequests = 3;

    const [hardcodedAds, setHardcodedAds] = useState([
        {
            id: 1,
            title: "Spacious Apartment in Downtown",
            status: "Active",
            description: "A beautiful apartment in the heart of the city. Close to everything.",
            image: "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-1.jpg",
            rent: 1500,
        },
        {
            id: 2,
            title: "Cozy Studio Near University",
            status: "Pending Approval",
            description: "Perfect for students. Affordable and walking distance to campus.",
            image: "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-2.jpg",
            rent: 800,
        },
        {
            id: 3,
            title: "Luxury Villa with Pool",
            status: "Disabled",
            description: "A luxurious villa with a private pool and garden.",
            image: "https://gdsd.s3.eu-central-1.amazonaws.com/public/property/building-3.jpg",
            rent: 5000,
        },
    ]);

    const DEFAULT_FILTERS = {
        status: "All",
        minPrice: 0,
        maxPrice: 5000,
    };

    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const form = useForm({
        mode: "uncontrolled",
        initialValues: DEFAULT_FILTERS,
    });

    // Count active and disabled ads dynamically
    const activeAdsCount = hardcodedAds.filter((ad) => ad.status === "Active").length;
    const disabledAdsCount = hardcodedAds.filter((ad) => ad.status === "Disabled").length;

    // Filtered ads based on filters state
    const filteredAds = hardcodedAds.filter((ad) => {
        if (filters.status !== "All" && ad.status !== filters.status) {
            return false;
        }
        if (ad.rent < filters.minPrice || ad.rent > filters.maxPrice) {
            return false;
        }
        return true;
    });

    // Function to toggle property status
    const handleToggleStatus = (id) => {
        setHardcodedAds((prevAds) =>
            prevAds.map((ad) =>
                ad.id === id
                    ? { ...ad, status: ad.status === "Active" ? "Disabled" : "Active" }
                    : ad
            )
        );
    };

    return (
        <>
            <h1>Landlord Dashboard</h1>
            <div className={classes.container}>
                <aside className={classes.filtersSection}>
                    <div className={classes.filtersHeader}>
                        <h2>Filters</h2>
                        <Button size="compact-xs" color="gray" type="button" onClick={() => setShowFilters((prev) => !prev)}>
                            {showFilters ? "Hide Filters" : "Show Filters"}
                        </Button>
                    </div>

                    {showFilters && (
                        <form className={classes.filters} onSubmit={form.onSubmit((values) => setFilters(values))}>
                            <div className={classes.filter}>
                                <h4>Status:</h4>
                                <Select
                                    placeholder="Select Status"
                                    data={[
                                        { value: "All", label: "All" },
                                        { value: "Active", label: "Active" },
                                        { value: "Pending Approval", label: "Pending Approval" },
                                        { value: "Disabled", label: "Disabled" },
                                    ]}
                                    key={form.key("status")}
                                    {...form.getInputProps("status")}
                                />
                            </div>

                            <div className={classes.filter}>
                                <h4>Price Range:</h4>
                                <SimpleGrid cols={2} spacing="xs">
                                    <NumberInput
                                        placeholder="Min. Rent"
                                        min={0}
                                        max={5000}
                                        step={50}
                                        prefix="€"
                                        key={form.key("minPrice")}
                                        {...form.getInputProps("minPrice")}
                                    />
                                    <NumberInput
                                        placeholder="Max. Rent"
                                        min={0}
                                        max={5000}
                                        step={50}
                                        prefix="€"
                                        key={form.key("maxPrice")}
                                        {...form.getInputProps("maxPrice")}
                                    />
                                </SimpleGrid>
                            </div>

                            <div className={classes.filterBtns}>
                                <Button type="submit" className={classes.applyFiltersBtn}>
                                    Apply Filters
                                </Button>
                                <Button
                                    color="gray"
                                    type="button"
                                    className={classes.resetFiltersBtn}
                                    onClick={() => {
                                        form.reset();
                                        setFilters(DEFAULT_FILTERS);
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    )}
                </aside>

                <div className={classes.mainContent}>
                    <div className={classes.dashboardSummary}>
                        <div className={classes.summaryHeader}>
                            <h2>Welcome to Dashboard!</h2>
                            <p>Your Ad details:</p>
                        </div>
                        <div className={classes.metricsGrid}>
                            <div className={classes.metricCard}>
                                <h4>Ads Active</h4>
                                <p>{activeAdsCount}</p>
                            </div>
                            <div className={classes.metricCard}>
                                <h4>Ads Disabled</h4>
                                <p>{disabledAdsCount}</p>
                            </div>
                            <div className={classes.metricCard}>
                                <h4>New Requests</h4>
                                <p>{hardcodedNewRequests}</p>
                            </div>
                        </div>
                        <div className={classes.actionButtons}>
                            <button onClick={openModal}>
                                Create New Listing
                            </button>
                            <button>Documents</button>
                            <button>
                                New Messages <span className={classes.badge}>6</span>
                            </button>
                        </div>
                    </div>

                    <div className={classes.resultsSection}>
                        {filteredAds.map((ad) => (
                            <div className={classes.propertyCard}>
                            <img src={ad.image} alt={ad.title} className={classes.propertyImage}/>
                                <div className={classes.propertyCardContent}>
                                    <div className={classes.propertyCardHeader}>
                                        <h4>{ad.title}</h4>
                                        {ad.status === "Pending Approval" ? (
                                            <Badge color="yellow">Pending Approval</Badge>
                                        ) : (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <Switch
                                                    label={ad.status}
                                                    checked={ad.status === "Active"}
                                                    onChange={() => handleToggleStatus(ad.id)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className={classes.propertyCardDescription}>{ad.description}</p>
                                    <div className={classes.propertyCardFooter}>
                                        <Button className={classes.propertyActionButton}>Action</Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredAds.length === 0 && (
                            <p className={classes.noResults}>No ads match your filters. Try adjusting the filters.</p>
                        )}
                    </div>
                </div>
                <CreateAdModal opened={isModalOpen} onClose={closeModal} />
            </div>
        </>
    );
};