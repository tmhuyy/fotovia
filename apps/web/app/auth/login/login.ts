"use server";

import { redirect } from "next/navigation";
import { FormError } from "../../interfaces/form-error.interface";
import { post } from "../../utils/fetch";

export default async function login(_prevState: FormError, formData: FormData) {
    const { error } = await post("auth/signin", formData);

    if (error) {
        return { error };
    }
    redirect("/");
}
