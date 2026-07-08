const STORAGE_KEY = "assetpro_offices";

// Initial default offices based on what might have been in the system
const DEFAULT_OFFICES = [
  { id: "HO-01", officeName: "Head Office", branchCode: "HO-01", city: "Mumbai", state: "MH", contact: "Admin" },
  { id: "REG-01", officeName: "Regional Office", branchCode: "REG-01", city: "Delhi", state: "DL", contact: "Manager" }
];

function getStorageKey() {
  try {
    const authUserStr = localStorage.getItem("authUser");
    if (authUserStr) {
      const user = JSON.parse(authUserStr);
      if (user && user.companyId) {
        return `${STORAGE_KEY}_${user.companyId}`;
      }
    }
  } catch (err) {
    console.error("Error reading authUser for offices key", err);
  }
  return STORAGE_KEY;
}

export function getOffices() {
  try {
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    if (!data) {
      // Seed default offices only if not a specific company
      const hasCompany = key !== STORAGE_KEY;
      const initial = hasCompany ? [] : DEFAULT_OFFICES;
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read offices from local storage", err);
    return DEFAULT_OFFICES;
  }
}

export function saveOffice(office) {
  const offices = getOffices();
  if (office.id) {
    const index = offices.findIndex((o) => o.id === office.id);
    if (index !== -1) {
      offices[index] = { ...offices[index], ...office };
    } else {
      offices.push(office);
    }
  } else {
    office.id = Date.now().toString();
    offices.push(office);
  }
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(offices));
  return offices;
}

export function deleteOffice(id) {
  let offices = getOffices();
  offices = offices.filter((o) => o.id !== id);
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(offices));
  return offices;
}
