"use client";
import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useFormState } from "react-dom";
import createUser from "./create-user";
import { useActionState } from "react";
export default function Signup() {
    const [state, formAction] = useActionState(createUser, { error: "" });
    return (
        <form action={formAction} className="w-full max-w-xs">
            <Stack spacing={2} >
                <TextField
                    name="email"
                    label="email"
                    variant="outlined"
                    type="text"
                />
                <TextField
                    name="password"
                    label="Password"
                    variant="outlined"
                    type="password"
                />
                <Button type="submit" variant="contained">
                    Signup
                </Button>
                <Link
                    component={NextLink}
                    href="/auth/login"
                    className="self-center"
                >
                    Login
                </Link>
            </Stack>
        </form>
    );
}
