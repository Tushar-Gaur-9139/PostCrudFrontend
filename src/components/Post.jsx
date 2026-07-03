import axios from "axios";
import { Plus, SquarePen, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Post = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 5;

    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const [confirmDelete, setConfirmDelete] = useState({
        show: false,
        id: null,
        loading: false
    });

    const showToastMessage = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    const fetchPosts = async (pageNumber = 1, searchQuery = "") => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8000/api/post", {
                params: {
                    page: pageNumber,
                    search: searchQuery,
                    per_page: itemsPerPage
                }
            });

            const paginator = res.data.data;
            setPosts(paginator.data || []);
            setTotalPages(paginator.last_page || 1);
            setCurrentPage(paginator.current_page || 1);
        } catch (error) {
            console.error("Error fetching posts:", error);
            showToastMessage("Failed to fetch posts from server.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPosts(1, search);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchPosts(page, search);
        }
    };

    const openDeleteModal = (id) => {
        setConfirmDelete({ show: true, id, loading: false });
    };

    const closeDeleteModal = () => {
        setConfirmDelete({ show: false, id: null, loading: false });
    };

    const deletePost = async () => {
        const id = confirmDelete.id;
        if (!id) return;

        setConfirmDelete((prev) => ({ ...prev, loading: true }));

        try {
            const res = await axios.delete(`http://localhost:8000/api/post/${id}`);

            if (res.data.status) {
                showToastMessage(res.data.message, "success");

                // Optimistic UI update
                setPosts((prev) => prev.filter((p) => p.id !== id));

                closeDeleteModal();
            } else {
                showToastMessage("Delete failed", "error");
                closeDeleteModal();
            }
        } catch (error) {
            console.error(error);
            showToastMessage("Server error while deleting", "error");
            closeDeleteModal();
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100 p-4 md:p-8">

            {/* TOAST */}
            {toast.show && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl text-white font-medium animate-bounce ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {confirmDelete.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Delete Post?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
                                disabled={confirmDelete.loading}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deletePost}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                disabled={confirmDelete.loading}
                            >
                                {confirmDelete.loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-lg">

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Post Management</h1>

                    <Link
                        to="/create-post"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Create Post
                    </Link>
                </div>

                <input
                    type="text"
                    placeholder="Search by name or price..."
                    className="mb-4 w-full rounded-lg border px-4 py-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Price</th>
                                <th className="px-6 py-4 text-left">Post</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        Loading...
                                    </td>
                                </tr>
                            ) : posts.length > 0 ? (
                                posts.map((post, index) => (
                                    <tr key={post.id} className="border-b">
                                        <td className="px-6 py-4 text-left">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>

                                        <td className="px-6 py-4 text-left">{post.name}</td>
                                        <td className="px-6 py-4 text-left">₹{post.price}</td>

                                        <td className="px-6 py-4 text-left">
                                            <img
                                                src={post.image}
                                                className="h-16 w-16 rounded object-cover"
                                                alt=""
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">

                                                <Link
                                                    to={`/edit-post/${post.id}`}
                                                    className="rounded bg-yellow-100 p-2 text-yellow-600"
                                                >
                                                    <SquarePen size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => openDeleteModal(post.id)}
                                                    className="rounded bg-red-100 p-2 text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        No posts found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION (UNCHANGED) */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? "bg-blue-600 text-white" : ""}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Post;