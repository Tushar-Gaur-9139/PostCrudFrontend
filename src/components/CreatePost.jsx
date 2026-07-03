import axios from "axios";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        sub_category: ""
    });

    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Global success/error toast status handle karne ke liye state
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const fileInputRef = useRef(null);

    const subCategoryMapping = {
        a: ["a1", "a2", "a3"],
        b: ["b1", "b2", "b3"],
        c: ["c1", "c2", "c3"]
    };

    const showToastMessage = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "category" && { sub_category: "" })
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file: file,
            previewUrl: URL.createObjectURL(file)
        }));
        setImages((prev) => [...prev, ...newImages]);

        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: "" }));
        }
    };

    const removeImage = (indexToRemove) => {
        setImages((prev) => {
            const updatedImages = prev.filter((_, index) => index !== indexToRemove);
            if (updatedImages.length === 0 && fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return updatedImages;
        });
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Name is required.";
        if (!formData.price || Number(formData.price) <= 0) tempErrors.price = "Price must be a positive number.";
        if (!formData.category) tempErrors.category = "Please select a category.";
        if (formData.category && !formData.sub_category) tempErrors.sub_category = "Please select a sub-category.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        setIsSubmitting(true);
        const submissionData = new FormData();
        submissionData.append("name", formData.name);
        submissionData.append("price", formData.price);
        submissionData.append("category", formData.category);
        submissionData.append("sub_category", formData.sub_category);

        images.forEach((imgObj) => {
            submissionData.append("images[]", imgObj.file);
        });

        try {
            const response = await axios.post("http://localhost:8000/api/post", submissionData, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 201 || response.data.status) {
                showToastMessage("Post created successfully!", "success");

                setFormData({ name: "", price: "", category: "", sub_category: "" });
                setImages([]);
                if (fileInputRef.current) fileInputRef.current.value = "";

                setTimeout(() => {
                    navigate("/");
                }, 1500);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const backendErrors = {};
                const incomingErrors = error.response.data.errors;

                Object.keys(incomingErrors).forEach((key) => {
                    if (key.startsWith("images")) {
                        backendErrors.images = incomingErrors[key][0];
                    } else {
                        backendErrors[key] = incomingErrors[key][0];
                    }
                });
                setErrors(backendErrors);
                showToastMessage("Validation Failed. Please check the fields.", "error");
            } else {
                const genericMessage = error.response?.data?.message || "Something went wrong!";
                showToastMessage(genericMessage, "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-100 flex items-center justify-center p-4">

            {/* --- GLOBAL TOAST NOTIFICATION CONTAINER (TOP RIGHT) --- */}
            {toast.show && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl text-white font-medium animate-bounce transition-all duration-300 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className="hover:opacity-80">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-3xl font-bold text-gray-800">Create Post</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter the post name"
                            className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 ${errors.name
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                }`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="Enter the post price"
                            className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 ${errors.price
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                }`}
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border px-4 py-3 bg-white outline-none transition focus:ring-2 ${errors.category
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                }`}
                        >
                            <option value="">Select category</option>
                            <option value="a">A</option>
                            <option value="b">B</option>
                            <option value="c">C</option>
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                    </div>

                    {/* Dependent Dropdown */}
                    {formData.category && (
                        <div className="animate-fadeIn">
                            <label className="mb-1 block text-sm font-medium text-gray-700">Sub Category</label>
                            <select
                                name="sub_category"
                                value={formData.sub_category}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-4 py-3 bg-white outline-none transition focus:ring-2 uppercase ${errors.sub_category
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                    }`}
                            >
                                <option value="">Select sub_category</option>
                                {subCategoryMapping[formData.category]?.map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                            {errors.sub_category && <p className="mt-1 text-sm text-red-500">{errors.sub_category}</p>}
                        </div>
                    )}

                    {/* File Upload */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Upload Post Images (Multiple allowed)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className={`w-full rounded-lg border bg-white px-3 py-2 outline-none ${errors.images ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                    </div>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                        <div className="mt-4">
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Selected Previews ({images.length})
                            </label>
                            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                                {images.map((img, index) => (
                                    <div key={index} className="group relative h-24 w-full rounded-lg border bg-gray-50 p-1 shadow-sm">
                                        <img
                                            src={img.previewUrl}
                                            alt="preview"
                                            className="h-full w-full rounded-md object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition disabled:bg-blue-400"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;