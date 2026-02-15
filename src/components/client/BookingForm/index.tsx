import { useState } from "react";
import { CircleCheck } from "lucide-react";
import type { FormData, FormErrors } from "@/libs/types/constants";
import "./BookingForm.css";

export default function BookingCalendarForm() {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [formData, setFormData] = useState<FormData>({
        firstname: "",
        surname: "",
        guests: "",
        date: "",
        room: "Any",
        nights: "",
        number: "",
        email: "",
        additionaltext: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const formatDate = (year: number, month: number, day: number) => {
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
    };

    const handleDateSelect = (dateStr: string) => {
        setSelectedDate(dateStr);
        setFormData((prev) => ({ ...prev, date: dateStr }));
    };

    const isDatePast = (year: number, month: number, day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(year, month, day);
        return checkDate < today;
    };

    const previousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
        );
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        );
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstname.trim())
            newErrors.firstname = "First name is required";
        if (!formData.surname.trim()) newErrors.surname = "Surname is required";
        if (!formData.guests)
            newErrors.guests = "Please select number of guests";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.nights)
            newErrors.nights = "Please select number of nights";
        if (!formData.number.trim())
            newErrors.number = "Contact number is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const response = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Server error");
            }

            setSubmitStatus("success");
            setSelectedDate("");

            setFormData({
                firstname: "",
                surname: "",
                guests: "",
                date: "",
                room: "Any",
                nights: "",
                number: "",
                email: "",
                additionaltext: "",
            });
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const dayNames = [
        "Sun", 
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(
            <div key={`empty-${i}`} className="calendar-day empty" />
        );
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const isPast = isDatePast(year, month, day);
        const isSelected = dateStr === selectedDate;

        calendarDays.push(
            <button
                key={day}
                type="button"
                className={`calendar-day ${isPast ? "past" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => !isPast && handleDateSelect(dateStr)}
                disabled={isPast}
            >
                {day}
            </button>
        );
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            {submitStatus === "success" && (
            <div className="success-message message" role="status">
                <div className="success-header message-header">
                    <CircleCheck />
                    <h4>Thank you!</h4>
                </div>
                <div className="success-body message-body">
                    <p>
                        Your booking request has been submitted. Please note,
                        your is reservation is not confirmed until you receive
                        confirmation.
                    </p>
                </div>
                <div>
                    <a href="/" className="success-button">
                        Go home
                    </a>
                </div>
            </div>
            )}

            {submitStatus === "error" && (
            <div className="error-message message" role="alert">
                <div className="error-header message-header">
                    <CircleCheck />
                    <h4>Something went wrong...</h4>
                </div>
                <div className="error-body message-body">
                    <p>
                        Sorry, there was an error submitting your booking.
                        Please try again in a few moments or call us directly during opening hours.
                    </p>
                </div>
            </div>
            )}
            {!selectedDate && submitStatus === "idle" && (
                    <div className="calendar-container">
                        <div className="calendar-header">
                            <h2>
                                {monthNames[month]} {year}
                            </h2>
                            <div className="calendar-nav">
                                <button onClick={previousMonth}>← Prev</button>
                                <button onClick={nextMonth}>Next →</button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {dayNames.map((day) => (
                                <div key={day} className="day-name">
                                    {day}
                                </div>
                            ))}
                            {calendarDays}
                        </div>
                    </div>
                )}

            {selectedDate && submitStatus === "idle" && (
                    <div className="form-container">
                        <div className="selected-date-display">
                            Selected date:{" "}
                            <strong>
                                {new Date(
                                    selectedDate + "T00:00:00"
                                ).toLocaleDateString("en-GB", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </strong>
                        </div>

                        <div>
                            <div className="form-group">
                                <label htmlFor="firstname">
                                    First Name <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="firstname"
                                    name="firstname"
                                    type="text"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    aria-invalid={!!errors.firstname}
                                    aria-describedby={
                                        errors.firstname
                                            ? "firstname-error"
                                            : undefined
                                    }
                                />
                                {errors.firstname && (
                                    <span
                                        id="firstname-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.firstname}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="surname">
                                    Surname <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="surname"
                                    name="surname"
                                    type="text"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    aria-invalid={!!errors.surname}
                                    aria-describedby={
                                        errors.surname
                                            ? "surname-error"
                                            : undefined
                                    }
                                />
                                {errors.surname && (
                                    <span
                                        id="surname-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.surname}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="guests">
                                    Number of guests{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <select
                                    id="guests"
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.guests}
                                    aria-describedby={
                                        errors.guests
                                            ? "guests-error"
                                            : undefined
                                    }
                                >
                                    <option value="">
                                        Select number of guests
                                    </option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                    <option value="10+">10+</option>
                                </select>
                                {errors.guests && (
                                    <span
                                        id="guests-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.guests}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="room">Room preference</label>
                                <select
                                    id="room"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a room</option>
                                    <option value="Any">Any</option>
                                    <option value="Red Angus">Red Angus</option>
                                    <option value="Limousin">Limousin</option>
                                    <option value="Corriente">Corriente</option>
                                    <option value="Ankole-Watusi">
                                        Ankole-Watusi
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nights">
                                    Number of nights{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <select
                                    id="nights"
                                    name="nights"
                                    value={formData.nights}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.nights}
                                    aria-describedby={
                                        errors.nights
                                            ? "nights-error"
                                            : undefined
                                    }
                                >
                                    <option value="">Select nights</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                    <option value="8+">8+</option>
                                </select>
                                {errors.nights && (
                                    <span
                                        id="nights-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.nights}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="number">
                                    Contact Number{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="number"
                                    name="number"
                                    type="tel"
                                    value={formData.number}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    aria-invalid={!!errors.number}
                                    aria-describedby={
                                        errors.number
                                            ? "number-error"
                                            : undefined
                                    }
                                />
                                {errors.number && (
                                    <span
                                        id="number-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.number}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address{" "}
                                    <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={
                                        errors.email ? "email-error" : undefined
                                    }
                                />
                                {errors.email && (
                                    <span
                                        id="email-error"
                                        className="error-message"
                                        role="alert"
                                    >
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="additionaltext">
                                    Additional text
                                </label>
                                <textarea
                                    id="additionaltext"
                                    name="additionaltext"
                                    rows={4}
                                    value={formData.additionaltext}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="button"
                                className="button-secondary"
                                disabled={isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}
