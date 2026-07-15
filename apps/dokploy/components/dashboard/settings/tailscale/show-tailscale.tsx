import {
	AlertTriangle,
	CheckCircle2,
	ExternalLink,
	Network,
	RefreshCw,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertBlock } from "@/components/shared/alert-block";
import { DialogAction } from "@/components/shared/dialog-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/utils/api";

const statusVariant = (status: string) => {
	if (status === "ready") return "default" as const;
	if (status === "degraded") return "destructive" as const;
	return "outline" as const;
};

export const ShowTailscale = () => {
	const utils = api.useUtils();
	const config = api.tailscale.getConfig.useQuery();
	const state = api.tailscale.list.useQuery(undefined, {
		enabled: Boolean(config.data),
	});
	const permissions = api.user.getPermissions.useQuery();
	const [tailnet, setTailnet] = useState("");
	const [dnsSuffix, setDnsSuffix] = useState("");
	const [clientId, setClientId] = useState("");
	const [clientSecret, setClientSecret] = useState("");
	const [deviceTag, setDeviceTag] = useState("tag:dokploy");
	const [translatedCidr, setTranslatedCidr] = useState("");

	useEffect(() => {
		if (!config.data) return;
		setTailnet(config.data.tailnet);
		setDnsSuffix(config.data.dnsSuffix);
		setClientId(config.data.oauthClientId);
		setDeviceTag(config.data.deviceTag);
		setTranslatedCidr(config.data.translatedCidr ?? "");
	}, [config.data]);

	const invalidate = async () => {
		await Promise.all([
			utils.tailscale.getConfig.invalidate(),
			utils.tailscale.list.invalidate(),
		]);
	};
	const connect = api.tailscale.connect.useMutation({
		onSuccess: async (result) => {
			toast.success(
				result.reconciliation.status === "degraded"
					? "Connected; private networking needs attention"
					: "Tailscale connected",
			);
			setClientSecret("");
			await invalidate();
		},
		onError: (error) => toast.error(error.message),
	});
	const reconcile = api.tailscale.reconcile.useMutation({
		onSuccess: async () => {
			toast.success("Tailscale reconciliation completed");
			await invalidate();
		},
		onError: async (error) => {
			toast.error(error.message);
			await invalidate();
		},
	});
	const confirmRetag = api.tailscale.confirmRetag.useMutation({
		onSuccess: async () => {
			toast.success("Gateway ownership confirmed");
			await invalidate();
		},
		onError: (error) => toast.error(error.message),
	});
	const updateTranslatedCidr = api.tailscale.updateTranslatedCidr.useMutation({
		onSuccess: async () => {
			toast.success("Private routing CIDR updated");
			await invalidate();
		},
		onError: (error) => toast.error(error.message),
	});
	const disconnect = api.tailscale.disconnect.useMutation({
		onSuccess: async () => {
			toast.success("Tailscale disconnected; stable mappings were retained");
			await invalidate();
		},
		onError: (error) => toast.error(error.message),
	});
	const purge = api.tailscale.purge.useMutation({
		onSuccess: async () => {
			toast.success("Dokploy-managed Tailscale state purged");
			await invalidate();
		},
		onError: (error) => toast.error(error.message),
	});

	if (config.isPending || permissions.isPending) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
				{["connection", "gateways", "endpoints"].map((section) => (
					<Skeleton key={section} className="h-44 w-full" />
				))}
			</div>
		);
	}
	if (config.error || permissions.error) {
		return (
			<AlertBlock type="error" className="mx-auto w-full max-w-5xl">
				Tailscale settings could not be loaded:{" "}
				{config.error?.message ?? permissions.error?.message}
			</AlertBlock>
		);
	}

	const access = permissions.data?.tailscale;
	const hasConfig = Boolean(config.data);
	const canSave = hasConfig ? access?.update : access?.create;
	const fieldsReady =
		tailnet.trim() && dnsSuffix.trim() && clientId.trim() && clientSecret;

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Network className="size-5 text-muted-foreground" />
						Tailscale connection
					</CardTitle>
					<CardDescription>
						Connect an organization OAuth client. Its secret is encrypted at
						rest and is never sent to deployment servers.
					</CardDescription>
					{hasConfig ? (
						<CardAction>
							<Badge variant={config.data?.enabled ? "default" : "outline"}>
								{config.data?.enabled ? "Connected" : "Disconnected"}
							</Badge>
						</CardAction>
					) : null}
				</CardHeader>
				<CardContent className="space-y-5">
					{config.data?.lastError ? (
						<AlertBlock type="warning">{config.data.lastError}</AlertBlock>
					) : null}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="ts-tailnet">Tailnet</Label>
							<Input
								id="ts-tailnet"
								value={tailnet}
								onChange={(event) => setTailnet(event.target.value)}
								placeholder="example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ts-dns">MagicDNS suffix</Label>
							<Input
								id="ts-dns"
								value={dnsSuffix}
								onChange={(event) => setDnsSuffix(event.target.value)}
								placeholder="example-tailnet.ts.net"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ts-client">OAuth client ID</Label>
							<Input
								id="ts-client"
								value={clientId}
								onChange={(event) => setClientId(event.target.value)}
								autoComplete="off"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ts-secret">OAuth client secret</Label>
							<Input
								id="ts-secret"
								type="password"
								value={clientSecret}
								onChange={(event) => setClientSecret(event.target.value)}
								autoComplete="new-password"
								placeholder="tskey-client-…"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ts-tag">Device tag</Label>
							<Input
								id="ts-tag"
								value={deviceTag}
								onChange={(event) => setDeviceTag(event.target.value)}
							/>
						</div>
						{hasConfig ? (
							<div className="space-y-2">
								<Label htmlFor="ts-cidr">Translated routing CIDR</Label>
								<div className="flex gap-2">
									<Input
										id="ts-cidr"
										value={translatedCidr}
										onChange={(event) => setTranslatedCidr(event.target.value)}
										placeholder="10.240.0.0/24"
									/>
									<Button
										type="button"
										variant="outline"
										disabled={!access?.update || !translatedCidr.trim()}
										isLoading={updateTranslatedCidr.isPending}
										onClick={() =>
											updateTranslatedCidr.mutate({
												translatedCidr: translatedCidr.trim(),
											})
										}
									>
										Save
									</Button>
								</div>
							</div>
						) : null}
					</div>
					<div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
						<p className="font-medium text-foreground">Required OAuth grants</p>
						<p className="mt-1">
							Scopes: <code>auth_keys</code>, <code>services</code>,{" "}
							<code>devices:core</code>. Grant ownership of{" "}
							<code>{deviceTag || "tag:dokploy"}</code>.
						</p>
						<a
							className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
							href="https://tailscale.com/docs/features/oauth-clients"
							target="_blank"
							rel="noreferrer"
						>
							Tailscale OAuth guide <ExternalLink className="size-3" />
						</a>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							disabled={!canSave || !fieldsReady}
							isLoading={connect.isPending}
							onClick={() =>
								connect.mutate({
									tailnet: tailnet.trim(),
									dnsSuffix: dnsSuffix.trim(),
									oauthClientId: clientId.trim(),
									oauthClientSecret: clientSecret,
									deviceTag: deviceTag.trim(),
								})
							}
						>
							<ShieldCheck className="size-4" />{" "}
							{hasConfig ? "Validate and save" : "Validate and connect"}
						</Button>
						{hasConfig && access?.update ? (
							<Button
								variant="outline"
								isLoading={reconcile.isPending}
								onClick={() => reconcile.mutate({})}
							>
								<RefreshCw className="size-4" /> Reconcile
							</Button>
						) : null}
						{hasConfig && access?.delete ? (
							<>
								<DialogAction
									title="Disconnect Tailscale?"
									description="This removes the OAuth credential and disables Dokploy routing while retaining stable endpoint and node state for reconnection."
									onClick={() => disconnect.mutate()}
								>
									<Button variant="outline">Disconnect</Button>
								</DialogAction>
								<DialogAction
									title="Purge managed Tailscale state?"
									description="This deletes Dokploy Services, owned gateways, routing, proxies, and stable endpoint mappings. Adopted host installations are preserved."
									onClick={() => purge.mutate()}
								>
									<Button variant="destructive">
										<Trash2 className="size-4" /> Purge
									</Button>
								</DialogAction>
							</>
						) : null}
					</div>
				</CardContent>
			</Card>

			{hasConfig && state.isPending ? (
				<div className="space-y-6">
					<Skeleton className="h-44 w-full" />
					<Skeleton className="h-44 w-full" />
				</div>
			) : null}
			{hasConfig && state.error ? (
				<AlertBlock type="error">
					Tailscale gateways and endpoints could not be loaded:{" "}
					{state.error.message}
				</AlertBlock>
			) : null}
			{hasConfig && state.data ? (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Gateways</CardTitle>
							<CardDescription>
								Native, adopted, or isolated Tailscale clients on the panel,
								deployment servers, and build servers.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{state.data?.gateways.length ? (
								state.data.gateways.map((gateway) => (
									<div
										key={gateway.tailscaleGatewayId}
										className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div>
											<p className="font-medium">
												{gateway.server?.name ?? "Dokploy panel"}
											</p>
											<p className="text-xs text-muted-foreground">
												{gateway.ownership} ·{" "}
												{gateway.version ?? "version unknown"} ·{" "}
												{gateway.tailnet ?? "not enrolled"}
											</p>
											{gateway.lastError ? (
												<p className="mt-1 text-xs text-destructive">
													{gateway.lastError}
												</p>
											) : null}
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={statusVariant(gateway.status)}>
												{gateway.status}
											</Badge>
											{gateway.ownership === "pending_retag" &&
											access?.update ? (
												<Button
													size="sm"
													variant="outline"
													isLoading={confirmRetag.isPending}
													onClick={() =>
														confirmRetag.mutate({
															tailscaleGatewayId: gateway.tailscaleGatewayId,
														})
													}
												>
													Confirm tag ownership
												</Button>
											) : null}
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">
									No gateways have been provisioned yet.
								</p>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Private endpoints</CardTitle>
							<CardDescription>
								Stable hostnames remain assigned while workloads are offline.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{state.data?.endpoints.length ? (
								state.data.endpoints.map((endpoint) => (
									<div
										key={endpoint.tailscaleEndpointId}
										className="rounded-lg border p-4"
									>
										<div className="flex flex-wrap items-start justify-between gap-2">
											<div>
												<p className="font-medium">{endpoint.readableName}</p>
												<code className="text-xs text-muted-foreground">
													{endpoint.fqdn}
												</code>
											</div>
											<Badge variant={statusVariant(endpoint.status)}>
												{endpoint.status}
											</Badge>
										</div>
										<div className="mt-3 flex flex-wrap gap-2">
											{endpoint.ports.map((port) => (
												<Badge
													key={port.tailscaleEndpointPortId}
													variant="outline"
													className="font-mono"
												>
													{port.secret
														? `${port.scheme}://••••••••:${port.targetPort} · secret`
														: `${port.scheme}://${endpoint.fqdn}:${port.targetPort}`}
												</Badge>
											))}
										</div>
										{endpoint.warning || endpoint.lastError ? (
											<div className="mt-3 flex items-start gap-2 text-xs text-amber-600">
												<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
												{endpoint.lastError ?? endpoint.warning}
											</div>
										) : endpoint.status === "ready" ? (
											<div className="mt-3 flex items-center gap-1 text-xs text-green-600">
												<CheckCircle2 className="size-3.5" /> Ready
											</div>
										) : null}
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">
									No eligible endpoints found.
								</p>
							)}
						</CardContent>
					</Card>
				</>
			) : null}
		</div>
	);
};
