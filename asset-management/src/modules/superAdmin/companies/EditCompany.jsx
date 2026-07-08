import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiInstance from "../../../apis/apiConfig";
import CompanyForm from "./CompanyForm";

function EditCompany() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiInstance.get(`/super-admin/company/${id}`);
        setInitialData(res.data.data);
      } catch (err) {
        console.error("Failed to load company", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!initialData) return <div>Company not found</div>;

  return <CompanyForm initialData={initialData} isEdit={true} isView={false} />;
}

export default EditCompany;
