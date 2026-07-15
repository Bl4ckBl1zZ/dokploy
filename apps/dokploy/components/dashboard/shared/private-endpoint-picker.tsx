import copy from "copy-to-clipboard";
import { Braces, Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

interface Props {
	projectId?: string | null;
	selfReferenceKey?: string | null;
}

export const PrivateEndpointPicker = ({
	projectId,
	selfReferenceKey,
}: Props) => {
	const permissions = api.user.getPermissions.useQuery();
	const canRead = Boolean(permissions.data?.tailscale?.read);
	const state = api.tailscale.list.useQuery(undefined, {
		enabled: canRead && Boolean(projectId),
	});
	if (!canRead || !projectId || !state.data?.endpoints.length) return null;

	const endpoints = state.data.endpoints.filter(
		(endpoint) => endpoint.projectId === projectId,
	);
	if (!endpoints.length) return null;

	const copyReference = (reference: string) => {
		copy(reference);
		toast.success("Private endpoint reference copied");
	};

	return (
		<div className="space-y-3 rounded-lg border bg-muted/20 p-3">
			<div className="flex items-center gap-2">
				<Braces className="size-4 text-muted-foreground" />
				<div>
					<p className="text-sm font-medium">Private endpoint references</p>
					<p className="text-xs text-muted-foreground">
						Copy a same-project reference into an environment value.
					</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				{selfReferenceKey ? (
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => copyReference("${{private.self.host}}")}
					>
						<Copy className="size-3" /> self.host
					</Button>
				) : null}
				{endpoints.flatMap((endpoint) => [
					<Button
						key={`${endpoint.tailscaleEndpointId}-host`}
						type="button"
						size="sm"
						variant="outline"
						onClick={() =>
							copyReference(`\${{private.${endpoint.referenceKey}.host}}`)
						}
					>
						<Copy className="size-3" /> {endpoint.referenceKey}.host
					</Button>,
					...endpoint.ports.map((port) => (
						<Button
							key={port.tailscaleEndpointPortId}
							type="button"
							size="sm"
							variant="outline"
							onClick={() =>
								copyReference(
									`\${{private.${endpoint.referenceKey}.url.${port.targetPort}}}`,
								)
							}
						>
							<Copy className="size-3" /> {endpoint.referenceKey}.url.
							{port.targetPort}
							{port.secret ? <Badge variant="secondary">secret</Badge> : null}
						</Button>
					)),
				])}
			</div>
		</div>
	);
};
