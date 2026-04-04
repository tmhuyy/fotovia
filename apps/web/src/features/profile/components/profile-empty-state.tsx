import type { AuthRole } from "../../../types/auth.types";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

interface ProfileEmptyStateProps {
    role: AuthRole;
    isCreating: boolean;
    onCreate: () => void;
}

export const ProfileEmptyState = ({
    role,
    isCreating,
    onCreate,
}: ProfileEmptyStateProps) => {
    const roleLabel = role === "photographer" ? "photographer" : "client";

    return (
        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
            <CardContent className="space-y-4 p-8">
                <div className="space-y-2">
                    <h2 className="font-serif text-3xl text-foreground">
                        Your profile is not ready yet
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-muted">
                        We could not find a profile foundation for this{" "}
                        {roleLabel} account. You can create the initial profile
                        now and continue editing it right away.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        className="rounded-full"
                        onClick={onCreate}
                        disabled={isCreating}
                    >
                        {isCreating
                            ? "Creating profile..."
                            : "Create profile foundation"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
