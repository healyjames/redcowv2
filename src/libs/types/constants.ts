export interface FormData {
    firstname: string;
    surname: string;
    guests: string;
    date: string;
    room: string;
    nights: string;
    number: string;
    email: string;
}

export interface FormErrors {
    [key: string]: string;
}
