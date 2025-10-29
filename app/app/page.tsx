/**
 * Landing Page
 * 
 * Provides an overview of the Workout POAP system with quick links to main features.
 */
export default function Home() {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Hero Section */}
            <div className="text-center py-12">
                <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                    Workout POAP
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Proof of Attendance Protocol for Fitness
                </p>
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                    Mint unique, time-scoped NFTs as proof of workout attendance via QR-based claims.
                    Track your fitness journey on-chain and compete on the monthly leaderboard!
                </p>
            </div>

            {/* How It Works */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    How It Works
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">1</span>
                        </div>
                        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Attend a Workout</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Join a registered trainer's workout session
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">2</span>
                        </div>
                        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Scan QR Code</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            After the workout, scan the trainer's QR code
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">3</span>
                        </div>
                        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Get Your NFT</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Claim a unique NFT with date, time, and trainer info
                        </p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Time-Scoped Claims
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                NFTs can only be claimed during a specific time window after each workout,
                                ensuring you were actually present.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Secure Verification
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                QR codes contain a cryptographic secret verified on-chain,
                                preventing fraudulent claims.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Customized Metadata
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Each NFT includes the workout date, time, and trainer name,
                                creating a permanent record of your attendance.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Monthly Leaderboard
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Track your attendance and compete with others on the monthly leaderboard.
                                Stay motivated!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="card bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900 dark:to-blue-900 dark:bg-opacity-20">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                    Get Started
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <a
                        href="/claim"
                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">📱</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Claim NFT</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Scan QR code to claim
                        </p>
                    </a>

                    <a
                        href="/trainer"
                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">🏋️</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Trainer</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Generate QR codes
                        </p>
                    </a>

                    <a
                        href="/leaderboard"
                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">🏆</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Leaderboard</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            See top performers
                        </p>
                    </a>

                    <a
                        href="/admin"
                        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
                    >
                        <div className="text-3xl mb-2">⚙️</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Admin</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Manage system
                        </p>
                    </a>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Built with</p>
                <div className="flex items-center justify-center space-x-6">
                    <span className="font-semibold">Solana</span>
                    <span>•</span>
                    <span className="font-semibold">Anchor</span>
                    <span>•</span>
                    <span className="font-semibold">Next.js</span>
                    <span>•</span>
                    <span className="font-semibold">Metaplex</span>
                </div>
            </div>
        </div>
    );
}

