"use client";

import { useState } from "react";
import Navbar from "../../UI/Navbar";
import { useCoachApp } from "../../lib/coach-store";

export default function CoachPage() {
	const {
		currentCoach,
		friends,
		incomingFriendRequests,
		incomingShares,
		updateCoachProfile,
		changeCoachPassword,
		searchCoachByEmail,
		sendFriendRequest,
		approveFriendRequest,
		declineFriendRequest,
		acceptSharedItem,
		declineSharedItem,
	} = useCoachApp();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [friendSearchEmail, setFriendSearchEmail] = useState("");
	const [friendSearchResult, setFriendSearchResult] = useState<{ id: string; email: string; displayName: string } | null>(null);
	const [friendStatusMessage, setFriendStatusMessage] = useState("");
	const [friendErrorMessage, setFriendErrorMessage] = useState("");

	const isGuest = currentCoach?.isGuest ?? true;

	const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage("");
		setStatusMessage("");

		const formData = new FormData(event.currentTarget);
		const displayName = String(formData.get("displayName") ?? "");
		const email = String(formData.get("email") ?? "");

		try {
			await updateCoachProfile({ displayName, email });
			setStatusMessage("Profile details saved.");
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Unable to save profile details.");
		}
	};

	const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage("");
		setStatusMessage("");

		if (newPassword !== confirmPassword) {
			setErrorMessage("New password and confirmation must match.");
			return;
		}

		try {
			await changeCoachPassword({ currentPassword, newPassword });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setStatusMessage("Password updated.");
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Unable to update password.");
		}
	};

	const handleFriendSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFriendErrorMessage("");
		setFriendStatusMessage("");
		setFriendSearchResult(null);

		try {
			const result = await searchCoachByEmail(friendSearchEmail);

			if (!result) {
				setFriendStatusMessage("No coach found with that email.");
				return;
			}

			if (friends.some((friend) => friend.id === result.id)) {
				setFriendStatusMessage("That coach is already in your friends list.");
				return;
			}

			setFriendSearchResult(result);
			setFriendStatusMessage("Coach found. Send a friend request to connect.");
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to search for coach.");
		}
	};

	const handleSendFriendRequest = async () => {
		if (!friendSearchResult) {
			return;
		}

		setFriendErrorMessage("");
		setFriendStatusMessage("");

		try {
			await sendFriendRequest(friendSearchResult.id);
			setFriendStatusMessage(`Friend request sent to ${friendSearchResult.displayName}.`);
			setFriendSearchEmail("");
			setFriendSearchResult(null);
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to send friend request.");
		}
	};

	const handleApproveFriendRequest = async (requesterId: string) => {
		setFriendErrorMessage("");
		setFriendStatusMessage("");

		try {
			const pendingRequest = incomingFriendRequests.find((request) => request.id === requesterId);
			await approveFriendRequest(requesterId);
			setFriendStatusMessage(
				pendingRequest ? `${pendingRequest.displayName} is now your friend.` : "Friend request approved.",
			);
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to approve friend request.");
		}
	};

	const handleDeclineFriendRequest = async (requesterId: string) => {
		setFriendErrorMessage("");
		setFriendStatusMessage("");

		try {
			await declineFriendRequest(requesterId);
			setFriendStatusMessage("Friend request declined.");
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to decline friend request.");
		}
	};

	const handleAcceptSharedItem = async (shareId: string) => {
		setFriendErrorMessage("");
		setFriendStatusMessage("");

		try {
			await acceptSharedItem(shareId);
			setFriendStatusMessage("Shared item added to your library.");
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to accept shared item.");
		}
	};

	const handleDeclineSharedItem = async (shareId: string) => {
		setFriendErrorMessage("");
		setFriendStatusMessage("");

		try {
			await declineSharedItem(shareId);
			setFriendStatusMessage("Shared item declined.");
		} catch (error) {
			setFriendErrorMessage(error instanceof Error ? error.message : "Unable to decline shared item.");
		}
	};

	return (
		<div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
			<Navbar />

			<main className="mx-auto mt-6 grid w-full max-w-5xl gap-6 lg:mt-8">
				<section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
					<p className="text-sm uppercase tracking-[0.35em] text-teal-700">Coach profile</p>
					<h2 className="mt-3 text-3xl font-semibold text-slate-950">Account settings</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
						Edit your profile name and account email, then update your password when needed.
					</p>

					{isGuest ? (
						<p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
							Guest sessions can view this page but cannot edit account details. Register or sign in with an email account to make changes.
						</p>
					) : null}

					{errorMessage ? (
						<p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
					) : null}

					{statusMessage ? (
						<p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
					) : null}

					<div className="mt-8 grid gap-6 lg:grid-cols-2">
						<form
							key={`${currentCoach?.id ?? "no-coach"}-${currentCoach?.email ?? ""}`}
							className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
							onSubmit={handleProfileSubmit}
						>
							<h3 className="text-lg font-semibold text-slate-950">Profile info</h3>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Display name</span>
								<input
									name="displayName"
									type="text"
									defaultValue={currentCoach?.displayName ?? ""}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
									placeholder="Coach name"
									required
									disabled={isGuest}
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Account email</span>
								<input
									name="email"
									type="email"
									defaultValue={currentCoach?.email ?? ""}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
									placeholder="coach@example.com"
									required
									disabled={isGuest}
								/>
							</label>

							<button
								type="submit"
								className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isGuest}
							>
								Save profile
							</button>
						</form>

						<form
							className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
							onSubmit={handlePasswordSubmit}
						>
							<h3 className="text-lg font-semibold text-slate-950">Security</h3>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Current password</span>
								<input
									type="password"
									value={currentPassword}
									onChange={(event) => setCurrentPassword(event.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
									placeholder="Current password"
									required
									disabled={isGuest}
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">New password</span>
								<input
									type="password"
									value={newPassword}
									onChange={(event) => setNewPassword(event.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
									placeholder="At least 8 characters"
									minLength={8}
									required
									disabled={isGuest}
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Confirm new password</span>
								<input
									type="password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
									placeholder="Repeat new password"
									minLength={8}
									required
									disabled={isGuest}
								/>
							</label>

							<button
								type="submit"
								className="w-full cursor-pointer rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isGuest}
							>
								Change password
							</button>
						</form>
					</div>

					<div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
						<h3 className="text-lg font-semibold text-slate-950">Friends</h3>
						<p className="mt-1 text-sm text-slate-600">Search by email to connect with other coaches.</p>

						{friendErrorMessage ? (
							<p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{friendErrorMessage}</p>
						) : null}

						{friendStatusMessage ? (
							<p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{friendStatusMessage}</p>
						) : null}

						<form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleFriendSearch}>
							<input
								type="email"
								value={friendSearchEmail}
								onChange={(event) => setFriendSearchEmail(event.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
								placeholder="coach@example.com"
								required
								disabled={isGuest}
								aria-label="Search coach by email"
							/>
							<button
								type="submit"
								className="cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isGuest}
							>
								Search
							</button>
						</form>

						{friendSearchResult ? (
							<div className="mt-4 flex flex-col gap-3 rounded-2xl border border-teal-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-medium text-slate-950">{friendSearchResult.displayName}</p>
									<p className="text-sm text-slate-600">{friendSearchResult.email}</p>
								</div>
								<button
									type="button"
									onClick={handleSendFriendRequest}
									className="cursor-pointer rounded-2xl bg-slate-950 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
								>
									Send request
								</button>
							</div>
						) : null}

							<div className="mt-5 space-y-2">
								<p className="text-sm font-medium text-slate-700">Incoming requests</p>
								{incomingFriendRequests.length ? (
									<ul className="space-y-2">
										{incomingFriendRequests.map((request) => (
											<li key={request.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
												<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
													<div>
														<p className="font-medium text-slate-950">{request.displayName}</p>
														<p className="text-sm text-slate-600">{request.email}</p>
													</div>
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() => handleApproveFriendRequest(request.id)}
															className="cursor-pointer rounded-2xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
														>
															Approve
														</button>
														<button
															type="button"
															onClick={() => handleDeclineFriendRequest(request.id)}
															className="cursor-pointer rounded-2xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
														>
															Decline
														</button>
													</div>
												</div>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-slate-500">No incoming friend requests.</p>
								)}
							</div>

						<div className="mt-5 space-y-2">
							<p className="text-sm font-medium text-slate-700">Items waiting for your review</p>
							{incomingShares.length ? (
								<ul className="space-y-2">
									{incomingShares.map((share) => (
										<li key={share.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
												<div>
													<p className="font-medium text-slate-950">{"title" in share.item ? share.item.title : share.item.name}</p>
													<p className="text-sm text-slate-600">
														From {share.senderDisplayName} • {share.kind === "conditioning" ? "Conditioning exercise" : share.kind === "skill" ? "Skill" : "Student transfer"}
													</p>
												</div>
												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() => void handleAcceptSharedItem(share.id)}
														className="cursor-pointer rounded-2xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
													>
														Accept
													</button>
													<button
														type="button"
														onClick={() => void handleDeclineSharedItem(share.id)}
														className="cursor-pointer rounded-2xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
													>
														Decline
													</button>
												</div>
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-slate-500">No shared items waiting for review.</p>
							)}
						</div>

						<div className="mt-5 space-y-2">
							<p className="text-sm font-medium text-slate-700">Your friends</p>
							{friends.length ? (
								<ul className="space-y-2">
									{friends.map((friend) => (
										<li key={friend.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
											<p className="font-medium text-slate-950">{friend.displayName}</p>
											<p className="text-sm text-slate-600">{friend.email}</p>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-slate-500">No friends added yet.</p>
							)}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
