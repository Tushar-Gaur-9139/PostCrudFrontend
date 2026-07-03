import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditPost = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        sub_category: ""
    });

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    const subCategoryMapping = {
        a: ["a1", "a2", "a3"],
        b: ["b1", "b2", "b3"],
        c: ["c1", "c2", "c3"]
    };

    const showToastMessage = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    };

    // 🔥 FETCH POST DATA
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/post/${id}`);

                const post = res.data.data;

                setFormData({
                    name: post.name || "",
                    price: post.price || "",
                    category: post.category || "",
                    sub_category: post.sub_category || ""
                });

                setExistingImages(post.images || []);
            } catch (error) {
                showToastMessage("Failed to load post data", "error");
            }
        };

        fetchPost();
    }, [id]);

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
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setImages((prev) => [...prev, ...newImages]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: "" }));
        }
    };

    const removeNewImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        let tempErrors = {};

        if (!formData.name.trim()) tempErrors.name = "Name is required.";
        if (!formData.price || Number(formData.price) <= 0)
            tempErrors.price = "Price must be positive.";
        if (!formData.category) tempErrors.category = "Category required.";
        if (formData.category && !formData.sub_category)
            tempErrors.sub_category = "Sub category required.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        setIsSubmitting(true);

        const form = new FormData();
        form.append("name", formData.name);
        form.append("price", formData.price);
        form.append("category", formData.category);
        form.append("sub_category", formData.sub_category);

        images.forEach((img) => {
            form.append("images[]", img.file);
        });

        form.append("existing_images", JSON.stringify(existingImages));

        try {
            const res = await axios.post(
                `http://localhost:8000/api/post/update/${id}`,
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (res.status === 200 || res.data.status) {
                showToastMessage("Post updated successfully!", "success");

                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            if (error.response?.status === 422) {
                const backendErrors = {};
                const incoming = error.response.data.errors;

                Object.keys(incoming).forEach((key) => {
                    backendErrors[key] = incoming[key][0];
                });

                setErrors(backendErrors);
                showToastMessage("Validation error", "error");
            } else {
                showToastMessage("Something went wrong", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            {/* TOAST */}
            {toast.show && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-xl ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ show: false })}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6">Edit Post</h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* NAME */}
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        className="w-full border p-3 rounded"
                    />
                    {errors.name && <p className="text-red-500">{errors.name}</p>}

                    {/* PRICE */}
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Price"
                        className="w-full border p-3 rounded"
                    />
                    {errors.price && <p className="text-red-500">{errors.price}</p>}

                    {/* CATEGORY */}
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border p-3 rounded"
                    >
                        <option value="">Select Category</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                    </select>

                    {/* SUB CATEGORY */}
                    {formData.category && (
                        <select
                            name="sub_category"
                            value={formData.sub_category}
                            onChange={handleInputChange}
                            className="w-full border p-3 rounded"
                        >
                            <option value="">Select Sub Category</option>
                            {subCategoryMapping[formData.category]?.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* EXISTING IMAGES */}
                    <div>
                        <h3 className="font-semibold mb-2">Saved Images</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {existingImages.map((img, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={`http://localhost:8000/storage/${img}`}
                                        className="h-24 w-full object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEW IMAGES */}
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="w-full border p-2 rounded"
                    />

                    <div className="grid grid-cols-3 gap-3 mt-2">
                        {images.map((img, i) => (
                            <div key={i} className="relative">
                                <img
                                    src={img.previewUrl}
                                    className="h-24 w-full object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(i)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Updating..." : "Update"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPost;