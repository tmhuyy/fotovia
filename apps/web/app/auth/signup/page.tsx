import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from 'next/link'
export default function Signup() {
    return (
        <Stack spacing={2} className="w-full max-w-xs">
            <TextField label="Username" variant="outlined" type="text" />
            <TextField label="Password" variant="outlined" type="password" />
            <Button variant="contained">Signup</Button>
            <Link
                component={NextLink}
                href="/auth/login"
                className="self-center"
            >
                Login
            </Link>
        </Stack>
    );
}
