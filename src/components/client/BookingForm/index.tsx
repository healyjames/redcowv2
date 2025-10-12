import { useState, type FormEvent } from "react";
import type { FormData, FormErrors } from "@/libs/types/constants";
import "./BookingForm.css";

export default function BookingForm() {
    const [formData, setFormData] = useState<FormData>({
        firstname: "",
        surname: "",
        guests: "",
        date: "",
        room: "Any",
        nights: "",
        number: "",
        email: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = "First name is required";
        }

        if (!formData.surname.trim()) {
            newErrors.surname = "Surname is required";
        }

        if (!formData.guests) {
            newErrors.guests = "Please select number of guests";
        }

        if (!formData.date) {
            newErrors.date = "Date is required";
        }

        if (!formData.nights) {
            newErrors.nights = "Please select number of nights";
        }

        if (!formData.number.trim()) {
            newErrors.number = "Contact number is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const response = await fetch("/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Submission failed");
            }

            setSubmitStatus("success");
            // Reset form
            setFormData({
                firstname: "",
                surname: "",
                guests: "",
                date: "",
                room: "Any",
                nights: "",
                number: "",
                email: "",
            });
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} noValidate>
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
                            errors.firstname ? "firstname-error" : undefined
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
                            errors.surname ? "surname-error" : undefined
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
                        Number of guests <span aria-hidden="true">*</span>
                    </label>
                    <select
                        id="guests"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        aria-invalid={!!errors.guests}
                        aria-describedby={
                            errors.guests ? "guests-error" : undefined
                        }
                    >
                        <option value="">Select number of guests</option>
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
                    <label htmlFor="date">
                        Date <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        aria-invalid={!!errors.date}
                        aria-describedby={
                            errors.date ? "date-error" : undefined
                        }
                    />
                    {errors.date && (
                        <span
                            id="date-error"
                            className="error-message"
                            role="alert"
                        >
                            {errors.date}
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
                        <option value="Ankole-Watusi">Ankole-Watusi</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="nights">
                        Number of nights <span aria-hidden="true">*</span>
                    </label>
                    <select
                        id="nights"
                        name="nights"
                        value={formData.nights}
                        onChange={handleChange}
                        aria-invalid={!!errors.nights}
                        aria-describedby={
                            errors.nights ? "nights-error" : undefined
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
                        Contact Number <span aria-hidden="true">*</span>
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
                            errors.number ? "number-error" : undefined
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
                        Email Address <span aria-hidden="true">*</span>
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

                {submitStatus === "success" && (
                    <div className="success-message" role="status">
                        Thank you! Your booking request has been submitted.
                        You'll receive a confirmation email shortly.
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="error-message" role="alert">
                        Sorry, there was an error submitting your booking.
                        Please try again.
                    </div>
                )}

                <button
                    type="submit"
                    className="button-secondary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}
