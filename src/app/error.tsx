'use client';

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
                <p className="text-lg text-gray-600 mb-8">Something went wrong</p>
                <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Go Home
                </a>
            </div>
        </div>
    );
}