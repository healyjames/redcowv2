export default function submitBookingForm() {
    const form = document.querySelector<HTMLFormElement>("#bookingForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("/api/rooms/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const result = await response.json();
            console.info("Booking successfully submitted.");
            form.reset();
        } catch (err) {
            console.error("Error submitting booking:", err);
            alert(
                "There was a problem submitting your booking. Please try again."
            );
        }
    });
}
