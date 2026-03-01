// Internationalization (i18n) support
const translations = {
    en: {
        nav: {
            home: 'Home',
            products: 'Products',
            orders: 'Orders',
            login: 'Login',
            register: 'Register',
            logout: 'Logout'
        },
        home: {
            title: 'Welcome to Coffee Shop Management',
            description: 'Manage your coffee shop products and orders efficiently.'
        },
        products: {
            title: 'Products',
            addProduct: 'Add Product',
            editProduct: 'Edit Product',
            deleteProduct: 'Delete Product',
            name: 'Name',
            description: 'Description',
            price: 'Price',
            category: 'Category',
            stock: 'Stock Quantity',
            actions: 'Actions',
            noProducts: 'No products found',
            createSuccess: 'Product created successfully',
            updateSuccess: 'Product updated successfully',
            deleteSuccess: 'Product deleted successfully'
        },
        orders: {
            title: 'Orders',
            createOrder: 'Create Order',
            editOrder: 'Edit Order',
            orderId: 'Order ID',
            customer: 'Customer',
            status: 'Status',
            total: 'Total Amount',
            date: 'Date',
            items: 'Items',
            quantity: 'Quantity',
            unitPrice: 'Unit Price',
            subtotal: 'Subtotal',
            noOrders: 'No orders found',
            createSuccess: 'Order created successfully',
            updateSuccess: 'Order updated successfully',
            deleteSuccess: 'Order deleted successfully',
            statuses: {
                pending: 'Pending',
                processing: 'Processing',
                completed: 'Completed',
                cancelled: 'Cancelled'
            }
        },
        auth: {
            login: 'Login',
            register: 'Register',
            email: 'Email',
            password: 'Password',
            name: 'Name',
            role: 'Role',
            loginSuccess: 'Login successful',
            registerSuccess: 'Registration successful',
            logoutSuccess: 'Logged out successfully',
            invalidCredentials: 'Invalid email or password',
            noAccount: "Don't have an account?",
            haveAccount: 'Already have an account?'
        },
        common: {
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            create: 'Create',
            update: 'Update',
            back: 'Back',
            add: 'Add',
            loading: 'Loading...',
            page: 'Page',
            of: 'of',
            previous: 'Previous',
            next: 'Next',
            required: 'This field is required',
            invalidEmail: 'Invalid email address',
            minLength: 'Minimum length is {min} characters',
            minValue: 'Minimum value is {min}'
        }
    },
    pl: {
        nav: {
            home: 'Strona główna',
            products: 'Produkty',
            orders: 'Zamówienia',
            login: 'Logowanie',
            register: 'Rejestracja',
            logout: 'Wyloguj'
        },
        home: {
            title: 'Witaj w systemie zarządzania kawiarnią',
            description: 'Efektywnie zarządzaj produktami i zamówieniami swojej kawiarni.'
        },
        products: {
            title: 'Produkty',
            addProduct: 'Dodaj produkt',
            editProduct: 'Edytuj produkt',
            deleteProduct: 'Usuń produkt',
            name: 'Nazwa',
            description: 'Opis',
            price: 'Cena',
            category: 'Kategoria',
            stock: 'Ilość w magazynie',
            actions: 'Akcje',
            noProducts: 'Brak produktów',
            createSuccess: 'Produkt został utworzony',
            updateSuccess: 'Produkt został zaktualizowany',
            deleteSuccess: 'Produkt został usunięty'
        },
        orders: {
            title: 'Zamówienia',
            createOrder: 'Utwórz zamówienie',
            editOrder: 'Edytuj zamówienie',
            orderId: 'ID zamówienia',
            customer: 'Klient',
            status: 'Status',
            total: 'Kwota całkowita',
            date: 'Data',
            items: 'Pozycje',
            quantity: 'Ilość',
            unitPrice: 'Cena jednostkowa',
            subtotal: 'Suma częściowa',
            noOrders: 'Brak zamówień',
            createSuccess: 'Zamówienie zostało utworzone',
            updateSuccess: 'Zamówienie zostało zaktualizowane',
            deleteSuccess: 'Zamówienie zostało usunięte',
            statuses: {
                pending: 'Oczekujące',
                processing: 'W trakcie',
                completed: 'Zakończone',
                cancelled: 'Anulowane'
            }
        },
        auth: {
            login: 'Logowanie',
            register: 'Rejestracja',
            email: 'Email',
            password: 'Hasło',
            name: 'Imię',
            role: 'Rola',
            loginSuccess: 'Logowanie udane',
            registerSuccess: 'Rejestracja udana',
            logoutSuccess: 'Wylogowano pomyślnie',
            invalidCredentials: 'Nieprawidłowy email lub hasło',
            noAccount: 'Nie masz konta?',
            haveAccount: 'Masz już konto?'
        },
        common: {
            save: 'Zapisz',
            cancel: 'Anuluj',
            edit: 'Edytuj',
            delete: 'Usuń',
            create: 'Utwórz',
            update: 'Aktualizuj',
            back: 'Wstecz',
            add: 'Dodaj',
            loading: 'Ładowanie...',
            page: 'Strona',
            of: 'z',
            previous: 'Poprzednia',
            next: 'Następna',
            required: 'To pole jest wymagane',
            invalidEmail: 'Nieprawidłowy adres email',
            minLength: 'Minimalna długość to {min} znaków',
            minValue: 'Minimalna wartość to {min}'
        }
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

const i18n = {
    t: (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[currentLang];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        if (typeof value !== 'string') {
            return key;
        }
        
        // Replace parameters
        return value.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    },
    
    setLang: (lang) => {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem('lang', lang);
            document.documentElement.lang = lang;
            // Trigger custom event for components to update
            window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
        }
    },
    
    getLang: () => currentLang
};

// Initialize language
document.documentElement.lang = currentLang;

