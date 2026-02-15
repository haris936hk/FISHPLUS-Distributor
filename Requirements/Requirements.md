# Functional Requirements Document

## AL - SHEIKH FISH TRADER AND DISTRIBUTER System

**Document Version:** 1.0  
**Date:** February 4, 2026  
**Purpose:** System Recreation/Modernization  
**Source:** UI Screenshot Analysis

---

## Executive Summary

This document details the functional requirements for a comprehensive fish trading and distribution management system. The system supports Urdu language interface with English labels, manages suppliers, customers, inventory, sales, purchases, and reporting with a focus on weight-based transactions.

---

## 1. DASHBOARD / HOME SCREEN

### 1.1 Screen Identification

- **Screen Name:** Main Dashboard
- **Purpose:** Central navigation hub and quick access to core functions

### 1.2 UI Element Inventory

**Administration Section:**

- Button: "Supplier Bill" (Supplier Bill)
- Button: "Supplier Stock Bill"
- Button: "Item"
- Icon: Green folder icon for Item

**Transaction Section:**

- Button: "Sale" with dollar sign icon
- Button: "Search Sale"
- Button: "Purchase" with checkmark icon
- Button: "Search Purchase"

**User Management Section:**

- Button: "Customer" with user icon
- Button: "Search Customers"
- Button: "Supplier" (Supplier) with user icon

**Reports Section:**

- Button: "Ledger"
- Button: "Item Wise Purchase Report"
- Button: "Stock Report"
- Button: "Customer Register"
- Button: "Client Sales Report"
- Button: "Daily Sales Details Report"
- Button: "Client Sales Discount Report"
- Button: "Supplier Sales Report"
- Button: "Item Sale Report"
- Button: "Daily Sales Report"
- Button: "Daily Net Amount Summary"

**Information Panel (Right Side):**

- Label: "Supplier Name"
- Label: "Advance Amount"
- Data display showing multiple suppliers with amounts:
  - حافظ امید حسن (Hafiz Umaid Hassan): 60000.00
  - شعیب اکرم (Shoaib Akram): 10000.00
  - اعظم/ولید فضل ٹاور (Azam/Waleed Fazal Tower): 10000.00
  - امان اللہ کھان تجارتی (Aman Ullah Khan Tijarati): 9275.00
  - احمد علی خان (Ahmed Ali Khan): 50001.01
  - انصارقبال (Ansar Iqbal): 3087.50
  - انیس اکرم (Anis Akram): 17835.00
  - ایوب کراچی (Ayub Karachi): 20414.00
  - (Additional entries visible)
- Label: "Item Name"
- Label: "Quantity"
- Data display: "سی جی (CG): 0.00"

**System Information:**

- Software branding: "FS BizTime 2009"
- Company name: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Release date: "Release Date: 29-January-2013"
- Footer: "www.futuresol.net"
- Watermark: "Activate Windows" (lower right)

### 1.3 Functional Requirements

#### A. User Actions

**FR-DASH-001:** The system shall provide a central dashboard as the primary navigation interface.

**FR-DASH-002:** The system shall allow users to navigate to the Supplier Bill creation screen via the "Supplier Bill" button.

**FR-DASH-003:** The system shall allow users to navigate to the Supplier Stock Bill screen via the "Supplier Stock Bill" button.

**FR-DASH-004:** The system shall allow users to navigate to the Item management screen via the "Item" button.

**FR-DASH-005:** The system shall allow users to navigate to the Sale transaction screen via the "Sale" button.

**FR-DASH-006:** The system shall allow users to navigate to the Sale search screen via the "Search Sale" button.

**FR-DASH-007:** The system shall allow users to navigate to the Purchase transaction screen via the "Purchase" button.

**FR-DASH-008:** The system shall allow users to navigate to the Purchase search screen via the "Search Purchase" button.

**FR-DASH-009:** The system shall allow users to navigate to the Customer management screen via the "Customer" button.

**FR-DASH-010:** The system shall allow users to navigate to the Customer search screen via the "Search Customers" button.

**FR-DASH-011:** The system shall allow users to navigate to the Supplier management screen via the "Supplier" button.

**FR-DASH-012:** The system shall allow users to access all report functions through dedicated report buttons.

#### B. Data Handling

**FR-DASH-013:** The system shall display a real-time list of suppliers with outstanding advance amounts on the dashboard.

**FR-DASH-014:** The system shall display supplier names in Urdu script.

**FR-DASH-015:** The system shall display advance amounts in decimal format (two decimal places).

**FR-DASH-016:** The system shall display current inventory quantity for selected items.

**FR-DASH-017:** The system shall display item names in Urdu script.

**FR-DASH-018:** The system shall maintain and display quantity values in decimal format.

**FR-DASH-019:** The system shall load the dashboard as the default landing page after application startup.

**FR-DASH-020:** The system shall transition to the selected module screen when a navigation button is clicked.

**FR-DASH-021:** [Inferred] The system shall refresh dashboard data displays at configurable intervals or on explicit user refresh action.

#### E. Business Rules

**FR-DASH-026:** The system shall calculate and display advance amounts as the sum of all advance payments made to each supplier minus any adjustments.

**FR-DASH-027:** [Inferred] The system shall display only suppliers with non-zero advance balances in the summary panel.

---

## 2. SUPPLIER MANAGEMENT MODULE

### 2.1 Supplier Entry Screen (Screenshot 2)

#### 2.1.1 Screen Identification

- **Screen Name:** Supplier Entry Form
- **Purpose:** Create and edit supplier records

#### 2.1.2 UI Element Inventory

**Input Fields:**

- Text Input: "Name (اردو)" - Supplier name in Urdu
- Text Input: "NIC #" with format hint "- -"
- Text Input: "Phone #"
- Text Input: "Mobile #"
- Text Input: "Email"
- Dropdown: "City"
- Dropdown: "Country"
- Text Area: "Address"

**Action Buttons:**

- Button: "Save" (primary action)
- Button: "Clear"
- Button: "Close"

**Icons:**

- Person icon with add symbol (top left)

#### 2.1.3 Functional Requirements

#### A. User Actions

**FR-SUP-001:** The system shall allow users to create new supplier records.

**FR-SUP-002:** The system shall allow users to edit existing supplier records.

**FR-SUP-003:** The system shall allow users to save supplier information via the "Save" button.

**FR-SUP-004:** The system shall allow users to clear all form fields via the "Clear" button.

**FR-SUP-005:** The system shall allow users to close the form without saving via the "Close" button.

#### B. Data Handling

**FR-SUP-006:** The system shall capture supplier name in Urdu script.

**FR-SUP-007:** The system shall capture National Identity Card (NIC) number with a specific format pattern.

**FR-SUP-008:** The system shall capture phone number.

**FR-SUP-009:** The system shall capture mobile number.

**FR-SUP-010:** The system shall capture email address.

**FR-SUP-011:** The system shall allow selection of city from a predefined list.

**FR-SUP-012:** The system shall allow selection of country from a predefined list.

**FR-SUP-013:** The system shall capture multi-line address information.

**FR-SUP-014:** The system shall support Urdu text input for the Name field.

#### C. Validation & Constraints

**FR-SUP-015:** [Inferred] The system shall validate that the NIC number follows the pattern "XXXXX-XXXXXXX-X" (5 digits, 7 digits, 1 digit).

**FR-SUP-016:** [Inferred] The system shall validate email format if provided.

**FR-SUP-017:** [Inferred] The system shall require at least one contact method (Phone, Mobile, or Email).

**FR-SUP-018:** [Inferred] The system shall prevent saving duplicate NIC numbers.

**FR-SUP-019:** [Inferred] The system shall validate that Name (اردو) is not empty before saving.

**FR-SUP-020:** [Inferred] The system shall limit text input lengths to reasonable maximum values.

#### D. System Responses

**FR-SUP-021:** The system shall display a success message upon successfully saving a supplier record.

**FR-SUP-022:** The system shall display validation errors inline near the relevant fields.

**FR-SUP-023:** The system shall clear all form fields when the "Clear" button is clicked.

**FR-SUP-024:** The system shall close the supplier entry form when the "Close" button is clicked.

**FR-SUP-025:** [Inferred] The system shall prompt for confirmation if the user attempts to close the form with unsaved changes.

**FR-SUP-026:** [Inferred] The system shall generate a unique supplier ID automatically upon saving a new supplier.

#### E. Business Rules

**FR-SUP-029:** The system shall store all supplier data in a centralized supplier master table.
---

### 2.2 Supplier Search Screen (Screenshot 3)

#### 2.2.1 Screen Identification

- **Screen Name:** Manage Clients (Supplier Search)
- **Purpose:** Search, view, and manage existing suppliers

#### 2.2.2 UI Element Inventory

**Search Section:**

- Text Input: "Name" (search filter)

**Results Grid:**

- Column: "Select" (checkbox)
- Column: "Name"
- Column: "City"
- Column: "Country"
- Column: "Edit" (action)
- Column: "Delete" (action)

**Action Buttons:**

- Button: "Print"
- Button: "Search"
- Button: "Close"

#### 2.2.3 Functional Requirements

#### A. User Actions

**FR-SUP-SEARCH-001:** The system shall allow users to search suppliers by name.

**FR-SUP-SEARCH-002:** The system shall allow users to select one or more suppliers via checkboxes.

**FR-SUP-SEARCH-003:** The system shall allow users to edit a supplier record via the "Edit" action.

**FR-SUP-SEARCH-004:** The system shall allow users to delete a supplier record via the "Delete" action.

**FR-SUP-SEARCH-005:** The system shall allow users to print the supplier list via the "Print" button.

**FR-SUP-SEARCH-006:** The system shall allow users to execute a search via the "Search" button.

**FR-SUP-SEARCH-007:** The system shall allow users to close the search screen via the "Close" button.

#### B. Data Handling

**FR-SUP-SEARCH-008:** The system shall display search results in a grid/table format.

**FR-SUP-SEARCH-009:** The system shall display supplier names in the results grid.

**FR-SUP-SEARCH-010:** The system shall display associated city for each supplier.

**FR-SUP-SEARCH-011:** The system shall display associated country for each supplier.

**FR-SUP-SEARCH-012:** The system shall support partial name matching in search functionality.

#### C. Validation & Constraints

**FR-SUP-SEARCH-013:** [Inferred] The system shall prevent deletion of suppliers with associated transactions.

**FR-SUP-SEARCH-014:** [Inferred] The system shall limit search results to a maximum number of records per page.

#### D. System Responses

**FR-SUP-SEARCH-015:** The system shall display an empty grid when no suppliers match the search criteria.

**FR-SUP-SEARCH-016:** The system shall navigate to the supplier edit form when "Edit" is clicked.

**FR-SUP-SEARCH-017:** The system shall prompt for confirmation before deleting a supplier.

**FR-SUP-SEARCH-018:** [Inferred] The system shall display a message indicating the number of search results found.

**FR-SUP-SEARCH-019:** [Inferred] The system shall refresh the grid after a supplier is deleted.

---

## 3. CUSTOMER MANAGEMENT MODULE

### 3.1 Customer Entry Screen (Screenshot 4)

#### 3.1.1 Screen Identification

- **Screen Name:** Clients Entry Form
- **Purpose:** Create and edit customer records

#### 3.1.2 UI Element Inventory

**Input Fields:**

- Text Input: "Name (اردو)" - Customer name in Urdu
- Text Input: "Name(English)" - Customer name in English
- Text Input: "NIC #" with format hint "- -"
- Text Input: "Mobile #" with example "Like: 03338988999"
- Dropdown: "Country"
- Text Input: "Phone #"
- Text Input: "Email"
- Dropdown: "City"
- Text Area: "Address"

**Action Buttons:**

- Button: "Save" (primary action)
- Button: "Clear"
- Button: "Close"

#### 3.1.3 Functional Requirements

#### A. User Actions

**FR-CUST-001:** The system shall allow users to create new customer records.

**FR-CUST-002:** The system shall allow users to edit existing customer records.

**FR-CUST-003:** The system shall allow users to save customer information via the "Save" button.

**FR-CUST-004:** The system shall allow users to clear all form fields via the "Clear" button.

**FR-CUST-005:** The system shall allow users to close the form without saving via the "Close" button.

#### B. Data Handling

**FR-CUST-006:** The system shall capture customer name in both Urdu and English.

**FR-CUST-007:** The system shall capture National Identity Card (NIC) number.

**FR-CUST-008:** The system shall capture mobile number with format guidance.

**FR-CUST-009:** The system shall capture phone number.

**FR-CUST-010:** The system shall capture email address.

**FR-CUST-011:** The system shall allow selection of city from a predefined list.

**FR-CUST-012:** The system shall allow selection of country from a predefined list.

**FR-CUST-013:** The system shall capture multi-line address information.

**FR-CUST-014:** The system shall support both Urdu and English text input for names.

#### C. Validation & Constraints

**FR-CUST-015:** [Inferred] The system shall validate that the NIC number follows the Pakistani format "XXXXX-XXXXXXX-X".

**FR-CUST-016:** The system shall validate mobile number format matches "03XXXXXXXXX" pattern.

**FR-CUST-017:** [Inferred] The system shall validate email format if provided.

**FR-CUST-018:** [Inferred] The system shall require either Urdu or English name to be populated.

**FR-CUST-019:** [Inferred] The system shall prevent saving duplicate NIC numbers.

**FR-CUST-020:** [Inferred] The system shall require at least one contact method.

#### D. System Responses

**FR-CUST-021:** The system shall display a success message upon successfully saving a customer record.

**FR-CUST-022:** The system shall display validation errors inline near the relevant fields.

**FR-CUST-023:** The system shall clear all form fields when the "Clear" button is clicked.

**FR-CUST-024:** The system shall close the customer entry form when the "Close" button is clicked.

**FR-CUST-025:** [Inferred] The system shall prompt for confirmation if the user attempts to close the form with unsaved changes.

**FR-CUST-026:** [Inferred] The system shall generate a unique customer ID automatically upon saving.

#### E. Business Rules

**FR-CUST-029:** The system shall store all customer data in a centralized customer master table.
**FR-CUST-031:** The system shall differentiate between customers and suppliers in the data model (they appear to be separate entities).

---

## 4. SUPPLIER BILL MODULE

### 4.1 Supplier Bill Report Generation (Screenshots 5 & 6)

#### 4.1.1 Screen Identification

- **Screen Name:** Supplier Bill Report (بیوپاری بل)
- **Purpose:** Generate and print supplier purchase bills

#### 4.1.2 UI Element Inventory (Screenshot 5)

**Filter Section (Left Panel):**

- Date Picker: "تاریخ" (Date From) - Default: "03/ February /2026"
- Date Picker: "سے تاریخ" (Date To) - Default: "03/ February /2026"
- Dropdown: "بیوپاری" (Supplier) - Shows "?? ?? ???????"
- Text Input: (Unlabeled field)
- Numeric Input: "مشینیہ" (Commission?) - Default: 0
- Numeric Input: "کریانہ" (Grocery/Other charges?) - Default: 0
- Numeric Input: "مزدوری" (Labor) - Default: 0
- Numeric Input: "برف" (Ice) - Default: 0
- Percentage Input: "کمیش %" - Default: 0%
- Numeric Display: "کمیش" (Discount) - Default: 0
- Numeric Input: "رعایت" (Concession) - Default: 0
- Numeric Input: "نقل" (Cash) - Default: 0
- Numeric Display: "اداینگی رقم" (Payable Amount) - Default: 0
- Button: "Save"
- Button: "Go"

**Report Preview (Right Panel):**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 051-5534607"
- Title: "بیوپاری بل" (Supplier Bill)
- Subtitle: "گڑی نمبر" (Vehicle Number)
- Date range display: "تک 02-03-2026 سے 02-03-2026"
- Table with columns:
  - "تک" (To/Serial)
  - "ریت من اوزن (kg)" (Rate per Weight)
  - "قسم" (Type/Category)
  - "سیریلنمبر" (Serial Number)
  - Row entry showing "1"
- Sub-table with Urdu labels:
  - "نقل وزن کلوگرام" (Net Weight Kilogram)
  - "نقل رقم" (Net Amount)
  - "سابقہ" (Previous)
  - "اداینگی رقم" (Payable Amount)
  - "رعایت" (Concession)
  - "برف" (Ice)
  - "نقل خرچ" (Net Expense)
  - "پختہ پکری" (Total/Final)

#### 4.1.3 UI Element Inventory (Screenshot 6)

**Similar layout with:**

- Report shows supplier name field
- Single row in table showing:
  - "نقل" (Net/Cash)
  - Table columns for weight and amount calculations

#### 4.1.4 Functional Requirements

#### A. User Actions

**FR-SUPBILL-001:** The system shall allow users to generate supplier bills for a specified date range.

**FR-SUPBILL-002:** The system shall allow users to select a specific supplier for bill generation.

**FR-SUPBILL-003:** The system shall allow users to input additional charges (commission, grocery, labor, ice).

**FR-SUPBILL-004:** The system shall allow users to apply percentage-based discounts.

**FR-SUPBILL-005:** The system shall allow users to apply fixed concession amounts.

**FR-SUPBILL-006:** The system shall allow users to record cash payments.

**FR-SUPBILL-007:** The system shall allow users to save the bill via the "Save" button.

**FR-SUPBILL-008:** The system shall allow users to generate/preview the bill via the "Go" button.

**FR-SUPBILL-009:** [Inferred] The system shall allow users to print the generated bill.

#### B. Data Handling

**FR-SUPBILL-010:** The system shall retrieve all purchase transactions for the selected supplier within the date range.

**FR-SUPBILL-011:** The system shall display transaction details including item type, weight, and rate.

**FR-SUPBILL-012:** The system shall aggregate multiple transactions into a single bill.

**FR-SUPBILL-013:** The system shall display company header information on the bill.

**FR-SUPBILL-014:** The system shall display contact information on the bill.

**FR-SUPBILL-015:** The system shall display the bill title and supplier details in Urdu.

**FR-SUPBILL-016:** The system shall display date range on the bill.

**FR-SUPBILL-017:** The system shall display vehicle number if applicable.

#### C. Validation & Constraints

**FR-SUPBILL-018:** [Inferred] The system shall validate that "Date From" is not later than "Date To".

**FR-SUPBILL-019:** [Inferred] The system shall require supplier selection before generating a bill.

**FR-SUPBILL-020:** [Inferred] The system shall validate that numeric inputs (charges, discounts) are non-negative.

**FR-SUPBILL-021:** [Inferred] The system shall validate that percentage discount is between 0 and 100.

#### D. System Responses

**FR-SUPBILL-022:** The system shall calculate total weight as the sum of all transaction weights.

**FR-SUPBILL-023:** The system shall calculate gross amount as sum(quantity × rate) for all transactions.

**FR-SUPBILL-024:** The system shall calculate discount amount as (gross amount × discount percentage / 100).

**FR-SUPBILL-025:** The system shall calculate total charges as sum(commission + grocery + labor + ice).

**FR-SUPBILL-026:** The system shall calculate net amount as (gross amount - discount - concession + charges).

**FR-SUPBILL-027:** The system shall calculate payable amount as (net amount - cash payment).

**FR-SUPBILL-028:** The system shall update all calculated fields in real-time as inputs change.

**FR-SUPBILL-029:** The system shall display the bill preview after clicking "Go".

**FR-SUPBILL-030:** [Inferred] The system shall save the bill data and update supplier account balance when "Save" is clicked.

**FR-SUPBILL-031:** [Inferred] The system shall generate a unique bill number for each saved bill.

#### E. Business Rules

**FR-SUPBILL-034:** The system shall update supplier account balance with the payable amount when a bill is saved.

**FR-SUPBILL-035:** [Inferred] The system shall mark associated purchase transactions as "billed" to prevent duplicate billing.

**FR-SUPBILL-036:** The system shall support Urdu language display for all bill elements.
**FR-SUPBILL-038:** The system shall treat commission, grocery, labor, and ice as deductions from the gross amount (or additions to supplier debt).

---

## 5. ITEM MANAGEMENT MODULE

### 5.1 Item Entry Screen (Screenshot 7)

#### 5.1.1 Screen Identification

- **Screen Name:** Items Entry Form
- **Purpose:** Create and manage inventory items

#### 5.1.2 UI Element Inventory

**Input Fields:**

- Text Input: "Item Name (اردو)" - Item name in Urdu
- Numeric Input: "Unit Price" - Default: 0
- Dropdown: "Category" - Default: "None"

**Action Buttons:**

- Button: "Save"
- Button: "Clear"
- Button: "Close"

#### 5.1.3 Functional Requirements

#### A. User Actions

**FR-ITEM-001:** The system shall allow users to create new inventory items.

**FR-ITEM-002:** The system shall allow users to edit existing inventory items.

**FR-ITEM-003:** The system shall allow users to save item information via the "Save" button.

**FR-ITEM-004:** The system shall allow users to clear all form fields via the "Clear" button.

**FR-ITEM-005:** The system shall allow users to close the form via the "Close" button.

#### B. Data Handling

**FR-ITEM-006:** The system shall capture item name in Urdu script.

**FR-ITEM-007:** The system shall capture unit price as a numeric value.

**FR-ITEM-008:** The system shall allow assignment of items to predefined categories.

**FR-ITEM-009:** The system shall support items without a category (None option).

#### C. Validation & Constraints

**FR-ITEM-010:** [Inferred] The system shall require item name to be unique.

**FR-ITEM-011:** [Inferred] The system shall validate that unit price is a non-negative number.

**FR-ITEM-012:** [Inferred] The system shall require item name before saving.

**FR-ITEM-013:** [Inferred] The system shall validate that item name is not empty or whitespace only.

#### D. System Responses

**FR-ITEM-014:** The system shall display a success message upon successfully saving an item.

**FR-ITEM-015:** The system shall display validation errors inline near the relevant fields.

**FR-ITEM-016:** The system shall clear all form fields when "Clear" is clicked.

**FR-ITEM-017:** The system shall close the item entry form when "Close" is clicked.

**FR-ITEM-018:** [Inferred] The system shall generate a unique item ID automatically upon saving.

**FR-ITEM-019:** [Inferred] The system shall prompt for confirmation if closing with unsaved changes.

#### E. Business Rules

**FR-ITEM-022:** The system shall maintain a master list of all inventory items.

**FR-ITEM-023:** [Inferred] The system shall prevent deletion of items that have transaction history.

**FR-ITEM-024:** [Inferred] The system shall support item categories for reporting and organization purposes.

**FR-ITEM-025:** The system shall default unit price to zero for new items.

---

## 6. SALES MODULE

### 6.1 Sale Entry Screen (Screenshot 8)

#### 6.1.1 Screen Identification

- **Screen Name:** Sale Transaction Entry
- **Purpose:** Record customer sales transactions

#### 6.1.2 UI Element Inventory

**Header Section:**

- Text Input: "بکری نمبر" (Sale Number) - Default: "00000"
- Text Input: "گڑی نمبر" (Vehicle Number)
- Dropdown: "بیوپاری" (Supplier) - appears to be customer dropdown in this context
- Date Picker: "بکری تاریخ" (Sale Date) - Default: "03/Feb/2026"
- Text Area: "تفصیل" (Details/Notes)
- Button: "Search Sale"

**Line Items Grid:**

- Column: "Delete" (checkbox with delete icon)
- Column: "وصولی" (Receipt/Collection)
- Column: "نقد" (Cash)
- Column: "نقل رقم" (Net Amount)
- Column: "کریانہ" (Grocery/Charges)
- Column: "برف" (Ice)
- Column: "وزن کلوگرام" (Weight in KG)
- Column: "کانٹہ" (Tare/Container weight)
- Column: "ریت قی من کلوگرام" (Rate per KG)
- Column: "مجموع" (Total)
- Column: "سٹاک" (Stock)
- Dropdown in grid cell for item selection
- Checkbox in grid cell

#### 6.1.3 Functional Requirements

#### A. User Actions

**FR-SALE-001:** The system shall allow users to create new sale transactions.

**FR-SALE-002:** The system shall allow users to specify a sale number.

**FR-SALE-003:** The system shall allow users to specify a vehicle number for the sale.

**FR-SALE-004:** The system shall allow users to select a customer (labeled as "بیوپاری").

**FR-SALE-005:** The system shall allow users to set the sale date.

**FR-SALE-006:** The system shall allow users to add free-text details/notes to the sale.

**FR-SALE-007:** The system shall allow users to add multiple line items to a sale.

**FR-SALE-008:** The system shall allow users to select items from a dropdown for each line.

**FR-SALE-009:** The system shall allow users to specify weight (kg), tare weight, and rate for each line item.

**FR-SALE-010:** The system shall allow users to specify additional charges (grocery, ice) per line item.

**FR-SALE-011:** The system shall allow users to record cash and receipt amounts per line item.

**FR-SALE-012:** The system shall allow users to delete individual line items via the delete checkbox.

**FR-SALE-013:** The system shall allow users to search for existing sales via "Search Sale" button.

**FR-SALE-014:** [Inferred] The system shall allow users to save the complete sale transaction.

#### B. Data Handling

**FR-SALE-015:** The system shall capture sale number as an alphanumeric identifier.

**FR-SALE-016:** The system shall capture vehicle number.

**FR-SALE-017:** The system shall capture customer ID (reference to customer master).

**FR-SALE-018:** The system shall capture sale date with default to current date.

**FR-SALE-019:** The system shall capture free-text details up to a reasonable character limit.

**FR-SALE-020:** The system shall capture item selection for each line.

**FR-SALE-021:** The system shall capture gross weight (kg) as a decimal value.

**FR-SALE-022:** The system shall capture tare/container weight (kg) as a decimal value.

**FR-SALE-023:** The system shall capture rate per kg as a decimal value.

**FR-SALE-024:** The system shall capture additional charges (grocery, ice) as decimal values.

**FR-SALE-025:** The system shall capture cash payment amount as a decimal value.

**FR-SALE-026:** The system shall capture receipt/collection amount as a decimal value.

**FR-SALE-027:** The system shall support multi-line item entry in a grid format.

#### C. Validation & Constraints

**FR-SALE-028:** [Inferred] The system shall validate that sale date is not in the future.

**FR-SALE-029:** [Inferred] The system shall require customer selection before saving.

**FR-SALE-030:** [Inferred] The system shall require at least one line item before saving.

**FR-SALE-031:** [Inferred] The system shall validate that all numeric fields are non-negative.

**FR-SALE-032:** [Inferred] The system shall validate that item is selected for each line before saving.

**FR-SALE-033:** [Inferred] The system shall check that sufficient stock is available for the selected item and quantity.

#### D. System Responses

**FR-SALE-034:** The system shall calculate net weight as (gross weight - tare weight) for each line item.

**FR-SALE-035:** The system shall calculate line total as (net weight × rate) for each line item.

**FR-SALE-036:** The system shall calculate net amount as (line total + grocery + ice) for each line item.

**FR-SALE-037:** The system shall display current stock level for the selected item in each line.

**FR-SALE-038:** The system shall update all calculated fields in real-time as inputs change.

**FR-SALE-039:** The system shall calculate sale grand total as sum of all line net amounts.

**FR-SALE-040:** The system shall calculate total cash collected as sum of all line cash amounts.

**FR-SALE-041:** The system shall calculate total receipts as sum of all line receipt amounts.

**FR-SALE-042:** [Inferred] The system shall generate a unique sale ID when saving a new transaction.

**FR-SALE-043:** [Inferred] The system shall update inventory stock levels upon saving the sale.

**FR-SALE-044:** [Inferred] The system shall update customer account balance upon saving the sale.

**FR-SALE-045:** [Inferred] The system shall remove deleted line items from the transaction when save is executed.

**FR-SALE-046:** [Inferred] The system shall display a success message after successfully saving a sale.
#### F. Business Rules

**FR-SALE-050:** The system shall default sale date to the current system date.

**FR-SALE-051:** The system shall default sale number to "00000" for new entries (auto-increment on save).
**FR-SALE-053:** The system shall treat grocery and ice as additions to the sale amount (charges to customer).

**FR-SALE-054:** [Inferred] The system shall support both cash and credit sales (cash < net amount implies credit).

**FR-SALE-055:** [Inferred] The system shall maintain transaction integrity - all line items must save or fail together.

---

### 6.2 Sale Search Screen (Screenshot 9)

#### 6.2.1 Screen Identification

- **Screen Name:** Inventory Sale Search
- **Purpose:** Search and manage existing sales transactions

#### 6.2.2 UI Element Inventory

**Filter Section:**

- Date Picker: "Sale Date From" - Default: "03/Feb/2026"
- Date Picker: "Sale Date To" - Default: "03/Feb/2026"
- Dropdown: "Client" - Default: "پڑک تاج حسن"
- Checkbox: "Check for all Clients"
- Text Input: "Sale #" - Default: 0
- Checkbox: "Check for given sale #"

**Results Grid:**

- Column: "Client"
- Column: "Supplier"
- Column: "VehicleNo"
- Column: "Date"
- Column: "Edit"
- Column: "Delete"

**Action Buttons:**

- Button: "Sale Date" - appears to be a date selector - Default: "03/Feb/2026"
- Button: "Print All Client Slip"
- Button: "Search"
- Button: "Close"

**Footer:**

- Label: "Records Found: 0"

#### 6.2.3 Functional Requirements

#### A. User Actions

**FR-SALESEARCH-001:** The system shall allow users to search sales by date range.

**FR-SALESEARCH-002:** The system shall allow users to filter sales by specific client.

**FR-SALESEARCH-003:** The system shall allow users to search across all clients via checkbox.

**FR-SALESEARCH-004:** The system shall allow users to search for a specific sale number.

**FR-SALESEARCH-005:** The system shall allow users to execute search via "Search" button.

**FR-SALESEARCH-006:** The system shall allow users to edit a sale transaction via "Edit" action.

**FR-SALESEARCH-007:** The system shall allow users to delete a sale transaction via "Delete" action.

**FR-SALESEARCH-008:** The system shall allow users to print all client slips for a selected date.

**FR-SALESEARCH-009:** The system shall allow users to close the search screen via "Close" button.

#### B. Data Handling

**FR-SALESEARCH-011:** The system shall display search results in a grid format.

**FR-SALESEARCH-012:** The system shall display client name for each sale.

**FR-SALESEARCH-013:** The system shall display supplier information if applicable.

**FR-SALESEARCH-014:** The system shall display vehicle number for each sale.

**FR-SALESEARCH-015:** The system shall display transaction date.

**FR-SALESEARCH-016:** The system shall display a count of records found.

**FR-SALESEARCH-017:** The system shall support filtering by date range, client, and sale number.

#### C. Validation & Constraints

**FR-SALESEARCH-018:** [Inferred] The system shall validate that "Date From" is not later than "Date To".

**FR-SALESEARCH-019:** [Inferred] The system shall disable client selection when "Check for all Clients" is checked.

**FR-SALESEARCH-020:** [Inferred] The system shall disable sale number input when not searching by specific number.

#### D. System Responses

**FR-SALESEARCH-021:** The system shall display matching sales in the results grid when search is executed.

**FR-SALESEARCH-022:** The system shall display "Records Found: 0" when no matches are found.

**FR-SALESEARCH-023:** The system shall navigate to sale edit screen when "Edit" is clicked.

**FR-SALESEARCH-024:** The system shall refresh the grid after a sale is deleted.

**FR-SALESEARCH-025:** [Inferred] The system shall generate printable client slips when "Print All Client Slip" is clicked.

**FR-SALESEARCH-026:** [Inferred] The system shall limit search results to a maximum number of records per page.

#### E. Business Rules
**FR-SALESEARCH-028:** The system shall support batch printing of client transaction slips.

---

## 7. PURCHASE MODULE

### 7.1 Purchase Entry Screen (Screenshot 10)

#### 7.1.1 Screen Identification

- **Screen Name:** Purchase Transaction Entry (خرداری ساحب)
- **Purpose:** Record supplier purchase transactions

#### 7.1.2 UI Element Inventory

**Header Section:**

- Text Input: "خریداری نمبر" (Purchase Number) - Default: "00000"
- Dropdown: "بیوپاری" (Supplier) - Default: "پڑک تاج حسن"
- Date Picker: "خریداری تاریخ" (Purchase Date) - Default: "03/Feb/2026"
- Text Area: "تفصیل" (Details/Notes)
- Button: "Search Purchase"

**Line Items Grid:**

- Column: "Delete" (with checkbox/icon)
- Column: "نقل رقم" (Net Amount)
- Column: "وزن" (Weight)
- Column: "ریت" (Rate)
- Column: "قسم" (Type/Category) - shows dropdown for item selection

**Footer Section:**

- Numeric Display: "نقل رقم" (Net Amount) - Default: 0
- Numeric Display: "رعایت" (Concession) - Default: 0
- Numeric Display: "نقل" (Cash) - Default: 0
- Numeric Display: "نقد" (Cash paid) - Default: 0
- Numeric Display: "سانقہ رقم" (Previous Amount) - Default: 0
- Numeric Display: "اداینگی رقم" (Payable Amount) - Default: 0

**Action Buttons:**

- Button: "New"
- Button: "Save"
- Button: "Print"
- Button: "Close"

#### 7.1.3 Functional Requirements

#### A. User Actions

**FR-PURCH-001:** The system shall allow users to create new purchase transactions.

**FR-PURCH-002:** The system shall allow users to specify a purchase number.

**FR-PURCH-003:** The system shall allow users to select a supplier.

**FR-PURCH-004:** The system shall allow users to set the purchase date.

**FR-PURCH-005:** The system shall allow users to add free-text details/notes.

**FR-PURCH-006:** The system shall allow users to add multiple line items to a purchase.

**FR-PURCH-007:** The system shall allow users to select item type for each line.

**FR-PURCH-008:** The system shall allow users to specify weight and rate for each line item.

**FR-PURCH-009:** The system shall allow users to delete individual line items.

**FR-PURCH-010:** The system shall allow users to create a new purchase via "New" button.

**FR-PURCH-011:** The system shall allow users to save the purchase via "Save" button.

**FR-PURCH-012:** The system shall allow users to print the purchase via "Print" button.

**FR-PURCH-013:** The system shall allow users to search existing purchases via "Search Purchase" button.

**FR-PURCH-014:** The system shall allow users to close the screen via "Close" button.

#### B. Data Handling

**FR-PURCH-015:** The system shall capture purchase number as an alphanumeric identifier.

**FR-PURCH-016:** The system shall capture supplier ID (reference to supplier master).

**FR-PURCH-017:** The system shall capture purchase date with default to current date.

**FR-PURCH-018:** The system shall capture free-text details.

**FR-PURCH-019:** The system shall capture item selection for each line.

**FR-PURCH-020:** The system shall capture weight as a decimal value.

**FR-PURCH-021:** The system shall capture rate as a decimal value.

**FR-PURCH-022:** The system shall support multi-line item entry.

#### C. Validation & Constraints

**FR-PURCH-023:** [Inferred] The system shall validate that purchase date is not in the future.

**FR-PURCH-024:** [Inferred] The system shall require supplier selection before saving.

**FR-PURCH-025:** [Inferred] The system shall require at least one line item before saving.

**FR-PURCH-026:** [Inferred] The system shall validate that all numeric fields are non-negative.

**FR-PURCH-027:** [Inferred] The system shall validate that item is selected for each line.

#### D. System Responses

**FR-PURCH-028:** The system shall calculate line amount as (weight × rate) for each line item.

**FR-PURCH-029:** The system shall calculate purchase total as sum of all line amounts.

**FR-PURCH-030:** The system shall display net amount in the footer section.

**FR-PURCH-031:** The system shall display previous outstanding amount for the supplier.

**FR-PURCH-032:** The system shall calculate payable amount as (net amount + previous amount - concession - cash).

**FR-PURCH-033:** The system shall update all calculated fields in real-time.

**FR-PURCH-034:** [Inferred] The system shall generate a unique purchase ID when saving.

**FR-PURCH-035:** [Inferred] The system shall update inventory stock levels upon saving.

**FR-PURCH-036:** [Inferred] The system shall update supplier account balance upon saving.

**FR-PURCH-037:** The system shall clear all fields when "New" is clicked.

**FR-PURCH-038:** [Inferred] The system shall generate a printable purchase receipt when "Print" is clicked.
#### F. Business Rules

**FR-PURCH-041:** The system shall default purchase date to current system date.

**FR-PURCH-042:** The system shall default purchase number to "00000" for new entries.

**FR-PURCH-043:** The system shall retrieve and display supplier's previous outstanding balance.

**FR-PURCH-044:** The system shall treat concession as a reduction in amount payable to supplier.

**FR-PURCH-045:** [Inferred] The system shall support both immediate payment and credit purchases.

**FR-PURCH-046:** [Inferred] The system shall maintain transaction integrity for all line items.

---

### 7.2 Purchase Search Screen (Screenshot 11)

#### 7.2.1 Screen Identification

- **Screen Name:** Purchase Search
- **Purpose:** Search and manage existing purchase transactions

#### 7.2.2 UI Element Inventory

**Filter Section:**

- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "03/Feb/2026"
- Checkbox: "Check for Date"
- Dropdown: "Supplier" - Default: "?????? ??????420"
- Checkbox: "Check for given Supplier"
- Text Input: "Purchase #" - Default: 0
- Checkbox: "Check for given purchase #"

**Results Grid:**

- Column: "Purchase Id"
- Column: "Supplier"
- Column: "Date"
- Column: "Edit"
- Column: "Delete"

**Action Buttons:**

- Button: "Search"
- Button: "Close"

**Footer:**

- Label: "Records Found: 0"

#### 7.2.3 Functional Requirements

#### A. User Actions

**FR-PURCHSEARCH-001:** The system shall allow users to search purchases by date range.

**FR-PURCHSEARCH-002:** The system shall allow users to filter purchases by specific supplier.

**FR-PURCHSEARCH-003:** The system shall allow users to enable/disable date filter via checkbox.

**FR-PURCHSEARCH-004:** The system shall allow users to enable/disable supplier filter via checkbox.

**FR-PURCHSEARCH-005:** The system shall allow users to search for a specific purchase number.

**FR-PURCHSEARCH-006:** The system shall allow users to execute search via "Search" button.

**FR-PURCHSEARCH-007:** The system shall allow users to edit a purchase via "Edit" action.

**FR-PURCHSEARCH-008:** The system shall allow users to delete a purchase via "Delete" action.

**FR-PURCHSEARCH-009:** The system shall allow users to close the search screen via "Close" button.

#### B. Data Handling

**FR-PURCHSEARCH-010:** The system shall display search results in a grid format.

**FR-PURCHSEARCH-011:** The system shall display purchase ID for each transaction.

**FR-PURCHSEARCH-012:** The system shall display supplier name for each purchase.

**FR-PURCHSEARCH-013:** The system shall display transaction date.

**FR-PURCHSEARCH-014:** The system shall display a count of records found.

#### C. Validation & Constraints

**FR-PURCHSEARCH-015:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-PURCHSEARCH-016:** [Inferred] The system shall disable date inputs when date filter checkbox is unchecked.

**FR-PURCHSEARCH-017:** [Inferred] The system shall disable supplier selection when supplier filter checkbox is unchecked.

#### D. System Responses

**FR-PURCHSEARCH-018:** The system shall display matching purchases when search is executed.

**FR-PURCHSEARCH-019:** The system shall display "Records Found: 0" when no matches are found.

**FR-PURCHSEARCH-020:** The system shall navigate to purchase edit screen when "Edit" is clicked.

**FR-PURCHSEARCH-021:** The system shall prompt for confirmation before deleting a purchase.

**FR-PURCHSEARCH-022:** The system shall refresh the grid after a purchase is deleted.

**FR-PURCHSEARCH-023:** [Inferred] The system shall apply active filters in combination (AND logic).
#### F. Business Rules
**FR-PURCHSEARCH-027:** [Inferred] The system shall reverse inventory and account updates when a purchase is deleted.

---

## 8. REPORTING MODULE

### 8.1 Client Recovery Report (Screenshot 12)

#### 8.1.1 Screen Identification

- **Screen Name:** Client Recovery Report (کلائنٹ بکری)
- **Purpose:** Generate client-wise sales recovery report

#### 8.1.2 UI Element Inventory

**Filter Section:**

- Dropdown: "Client" - Default: "پڑک تاج حسن"
- Checkbox: "Check for All Clients"
- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "03/Feb/2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 051-5534607"
- Title: "کلائنٹ بکری" (Client Recovery)
- Subtitle: "فلیٹ" (Flat/Unit)
- Date range: "تک 02-03-2026 سے 02-03-2026"
- Table with columns:
  - "تک" (To/Serial)
  - "فروش" (Sale)
  - "وزن" (Weight)
  - "ریت" (Rate)
  - "قسم" (Type)
  - "تاریخ" (Date)
  - "بکری نمبر" (Sale Number)
- Sub-table with rows:
  - "الخراجات" (Expenses) | "فروش رقم" (Sale Amount)
  - "وصولی" (Collection) | "نقدی" (Cash)
  - "فروش وصولی" (Sale Collection) | "فروش رقم" (Sale Amount)
  - "رعایت" (Concession)
  - "یہ رقم" (This Amount)
  - "فروش" (Sale)

**Navigation:**

- Print/export buttons in toolbar
- "SAP CRYSTAL REPORTS®" watermark

#### 8.1.3 Functional Requirements

#### A. User Actions

**FR-CLIENTRPT-001:** The system shall allow users to generate client recovery reports.

**FR-CLIENTRPT-002:** The system shall allow users to select a specific client for the report.

**FR-CLIENTRPT-003:** The system shall allow users to generate reports for all clients via checkbox.

**FR-CLIENTRPT-004:** The system shall allow users to specify a date range for the report.

**FR-CLIENTRPT-005:** The system shall allow users to generate the report via "Go" button.

**FR-CLIENTRPT-006:** [Inferred] The system shall allow users to print the generated report.

**FR-CLIENTRPT-007:** [Inferred] The system shall allow users to export the report to various formats.

#### B. Data Handling

**FR-CLIENTRPT-008:** The system shall retrieve all sales transactions for the selected client(s) within the date range.

**FR-CLIENTRPT-009:** The system shall display transaction details including sale number, date, item type, weight, rate.

**FR-CLIENTRPT-010:** The system shall display company header information on the report.

**FR-CLIENTRPT-011:** The system shall display contact information on the report.

**FR-CLIENTRPT-012:** The system shall display report title and client details in Urdu.

**FR-CLIENTRPT-013:** The system shall display date range on the report.

#### C. Validation & Constraints

**FR-CLIENTRPT-014:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-CLIENTRPT-015:** [Inferred] The system shall disable client selection when "Check for All Clients" is checked.

#### D. System Responses

**FR-CLIENTRPT-016:** The system shall calculate total sale amount as sum(weight × rate) for all transactions.

**FR-CLIENTRPT-017:** The system shall calculate total expenses (charges applied to client).

**FR-CLIENTRPT-018:** The system shall calculate total collections (cash and receipts received).

**FR-CLIENTRPT-019:** The system shall calculate total concessions granted.

**FR-CLIENTRPT-020:** The system shall calculate net amount due as (sale amount + expenses - collections - concessions).

**FR-CLIENTRPT-021:** The system shall display the report preview after clicking "Go".

**FR-CLIENTRPT-022:** The system shall group transactions by client when reporting for all clients.

**FR-CLIENTRPT-023:** [Inferred] The system shall display subtotals for each client in multi-client reports.
#### F. Business Rules

**FR-CLIENTRPT-025:** The system shall use the same calculation logic as individual sale transactions.

**FR-CLIENTRPT-026:** The system shall support Urdu language display for all report elements.

---

### 8.2 Item Sale Report (Screenshot 13)

#### 8.2.1 Screen Identification

- **Screen Name:** Item Wholesale Report (مجملہ بکری)
- **Purpose:** Generate item-wise sales report

#### 8.2.2 UI Element Inventory

**Filter Section:**

- Dropdown: "Item" - Default: "جھر"
- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "02/Feb/2026" [Note: appears to be 03]
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 651-5534607"
- Title: "مجملہ بکری" (Summary Sale)
- Subtitle: "قسم" (Type/Category)
- Date range: "تک 02 Mar.2026 سے 02 Mar.2026"
- Table with columns:
  - "تک" (Serial)
  - "فروش" (Sale)
  - "وزنکجوہ" (Weight in KG)
  - "ریت من" (Rate per)
  - "فلیٹ" (Flat/Client)
  - "تاریخ" (Date)

#### 8.2.3 Functional Requirements

#### A. User Actions

**FR-ITEMRPT-001:** The system shall allow users to generate item-wise sales reports.

**FR-ITEMRPT-002:** The system shall allow users to select a specific item for the report.

**FR-ITEMRPT-003:** The system shall allow users to specify a date range for the report.

**FR-ITEMRPT-004:** The system shall allow users to generate the report via "Go" button.

**FR-ITEMRPT-005:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-ITEMRPT-006:** The system shall retrieve all sales of the selected item within the date range.

**FR-ITEMRPT-007:** The system shall display transaction details including date, client, weight, rate, and sale amount.

**FR-ITEMRPT-008:** The system shall display report header and title in Urdu.

#### C. Validation & Constraints

**FR-ITEMRPT-009:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-ITEMRPT-010:** [Inferred] The system shall require item selection before generating the report.

#### D. System Responses

**FR-ITEMRPT-011:** The system shall calculate total weight sold for the item.

**FR-ITEMRPT-012:** The system shall calculate total sale amount.

**FR-ITEMRPT-013:** The system shall calculate average rate if multiple transactions exist.

**FR-ITEMRPT-014:** The system shall display the report preview after clicking "Go".

**FR-ITEMRPT-015:** [Inferred] The system shall sort transactions by date in chronological order.
#### F. Business Rules

**FR-ITEMRPT-017:** The system shall include all sale transactions regardless of payment status.

---

### 8.3 Daily Sales Report (Screenshot 14)

#### 8.3.1 Screen Identification

- **Screen Name:** Daily Sales Summary (امروزہ بکری)
- **Purpose:** Generate daily sales summary report

#### 8.3.2 UI Element Inventory

**Filter Section:**

- Date Picker: "From Date" - Default: "03/ February /2026"
- Date Picker: "To Date" - Default: "03/ February /2026"
- Button: "Go"

**Report Preview:**

- Header: "AL -SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Title: "امروزہ بکری" (Today's Sales)
- Date range: "تاریخ: 02-03-2026 سے 02-03-2026"
- Table with columns:
  - "رقم" (Amount)
  - "وزن کلوگرام" (Weight in KG)
  - "مال" (Item)
  - "سیریلنمبر" (Serial Number)
  - Row entry showing "1"
- Summary rows (right-aligned):
  - "وزن" (Weight)
  - "رقم" (Amount)
  - "الخراجات" (Expenses)
  - "نقل رقم" (Net Amount)
  - "نقدی" (Cash)
  - "وصولی" (Collection)
  - "رعایت" (Concession)
  - "نقل" (Net/Balance)

#### 8.3.3 Functional Requirements

#### A. User Actions

**FR-DAILYRPT-001:** The system shall allow users to generate daily sales summary reports.

**FR-DAILYRPT-002:** The system shall allow users to specify a date range for the report.

**FR-DAILYRPT-003:** The system shall allow users to generate the report via "Go" button.

**FR-DAILYRPT-004:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-DAILYRPT-005:** The system shall retrieve all sales transactions within the specified date range.

**FR-DAILYRPT-006:** The system shall aggregate data by item type.

**FR-DAILYRPT-007:** The system shall display summary totals for key metrics.

#### C. Validation & Constraints

**FR-DAILYRPT-008:** [Inferred] The system shall validate that "From Date" is not later than "To Date".

#### D. System Responses

**FR-DAILYRPT-009:** The system shall calculate total weight sold per item.

**FR-DAILYRPT-010:** The system shall calculate total amount per item.

**FR-DAILYRPT-011:** The system shall calculate aggregate weight across all items.

**FR-DAILYRPT-012:** The system shall calculate aggregate amount (gross sales).

**FR-DAILYRPT-013:** The system shall calculate total expenses (all charges).

**FR-DAILYRPT-014:** The system shall calculate net amount as (gross sales + expenses).

**FR-DAILYRPT-015:** The system shall calculate total cash collected.

**FR-DAILYRPT-016:** The system shall calculate total collections (receipts).

**FR-DAILYRPT-017:** The system shall calculate total concessions granted.

**FR-DAILYRPT-018:** The system shall calculate net balance as (net amount - cash - collections - concessions).

**FR-DAILYRPT-019:** The system shall display the report preview after clicking "Go".
#### F. Business Rules

**FR-DAILYRPT-021:** The system shall include all transactions within the date range regardless of status.

**FR-DAILYRPT-022:** The system shall use consistent calculation methodology with transaction screens.

---

### 8.4 Ledger Report (Screenshot 15)

#### 8.4.1 Screen Identification

- **Screen Name:** Account Ledger
- **Purpose:** Generate account ledger for customers/suppliers

#### 8.4.2 UI Element Inventory

**Filter Section:**

- Dropdown: "Account" - Shows "(دانش شاید کنگیر 13847)" with Urdu text
- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "03/Feb/2026"
- Button: "Go"

**Report Preview:**

- Blank report canvas
- "SAP CRYSTAL REPORTS®" watermark
- Toolbar with navigation and export options

**Footer:**

- Label: "Current Page No.:"
- Label: "Total Page No.:"
- Label: "Zoom Factor: 100%"

#### 8.4.3 Functional Requirements

#### A. User Actions

**FR-LEDGER-001:** The system shall allow users to generate account ledgers.

**FR-LEDGER-002:** The system shall allow users to select a specific account (customer or supplier).

**FR-LEDGER-003:** The system shall allow users to specify a date range for the ledger.

**FR-LEDGER-004:** The system shall allow users to generate the ledger via "Go" button.

**FR-LEDGER-005:** [Inferred] The system shall allow users to print the generated ledger.

**FR-LEDGER-006:** [Inferred] The system shall allow users to export the ledger to various formats.

**FR-LEDGER-007:** [Inferred] The system shall allow users to navigate between pages if the ledger spans multiple pages.

#### B. Data Handling

**FR-LEDGER-008:** The system shall retrieve all financial transactions for the selected account within the date range.

**FR-LEDGER-009:** [Inferred] The system shall display transaction details including date, description, debit, credit, and balance.

**FR-LEDGER-010:** [Inferred] The system shall display opening balance for the account.

**FR-LEDGER-011:** The system shall display account name/identifier in both Urdu and English.

#### C. Validation & Constraints

**FR-LEDGER-012:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-LEDGER-013:** [Inferred] The system shall require account selection before generating the ledger.

#### D. System Responses

**FR-LEDGER-014:** [Inferred] The system shall calculate opening balance as the account balance at the start of the date range.

**FR-LEDGER-015:** [Inferred] The system shall calculate running balance after each transaction.

**FR-LEDGER-016:** [Inferred] The system shall calculate closing balance as the final balance at the end of the date range.

**FR-LEDGER-017:** The system shall display the ledger preview after clicking "Go".

**FR-LEDGER-018:** [Inferred] The system shall sort transactions by date in chronological order.

**FR-LEDGER-019:** The system shall display page count and current page number.

**FR-LEDGER-020:** The system shall support zoom functionality for report preview.
#### F. Business Rules

**FR-LEDGER-023:** [Inferred] The system shall classify transactions as debits (sales, advances from customer) or credits (payments, returns).

**FR-LEDGER-024:** [Inferred] The system shall maintain separate ledgers for customers and suppliers.

**FR-LEDGER-025:** [Inferred] The system shall support both Urdu and English account names.

---

### 8.5 Item Purchase Report (Screenshot 16)

#### 8.5.1 Screen Identification

- **Screen Name:** Item Purchase Report
- **Purpose:** Generate item-wise purchase report

#### 8.5.2 UI Element Inventory

**Filter Section:**

- Dropdown: "Item" - Default: "جھر"
- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "03/Feb/2026"
- Button: "Go"

**Report Preview:**

- Blank report canvas
- "SAP CRYSTAL REPORTS®" watermark
- Toolbar with navigation and export options

**Footer:**

- Label: "Current Page No.:"
- Label: "Total Page No.:"
- Label: "Zoom Factor: 100%"

#### 8.5.3 Functional Requirements

#### A. User Actions

**FR-ITEMPURCHRPT-001:** The system shall allow users to generate item-wise purchase reports.

**FR-ITEMPURCHRPT-002:** The system shall allow users to select a specific item for the report.

**FR-ITEMPURCHRPT-003:** The system shall allow users to specify a date range for the report.

**FR-ITEMPURCHRPT-004:** The system shall allow users to generate the report via "Go" button.

**FR-ITEMPURCHRPT-005:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-ITEMPURCHRPT-006:** The system shall retrieve all purchases of the selected item within the date range.

**FR-ITEMPURCHRPT-007:** [Inferred] The system shall display transaction details including date, supplier, weight, rate, and amount.

#### C. Validation & Constraints

**FR-ITEMPURCHRPT-008:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-ITEMPURCHRPT-009:** [Inferred] The system shall require item selection before generating the report.

#### D. System Responses

**FR-ITEMPURCHRPT-010:** [Inferred] The system shall calculate total weight purchased.

**FR-ITEMPURCHRPT-011:** [Inferred] The system shall calculate total purchase amount.

**FR-ITEMPURCHRPT-012:** [Inferred] The system shall calculate average purchase rate.

**FR-ITEMPURCHRPT-013:** The system shall display the report preview after clicking "Go".
#### F. Business Rules

**FR-ITEMPURCHRPT-015:** The system shall include all purchase transactions regardless of payment status.

---

### 8.6 Stock Report (Screenshot 17)

#### 8.6.1 Screen Identification

- **Screen Name:** Stock Report (سٹاک رپورٹ)
- **Purpose:** Generate current inventory stock report

#### 8.6.2 UI Element Inventory

**Filter Section:**

- Date Picker: "Date" - Default: "03/Feb/2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 051-5534607"
- Title: "سٹاک رپورٹ" (Stock Report)
- Date: "سٹاک تاریخ 02-Mar-2026" (Stock Date)
- Table with columns:
  - "باقیا سٹاک" (Remaining Stock)
  - "آج می فروخت" (Today's Sale)
  - "آج می خرید" (Today's Purchase)
  - "سابقہ سٹاک" (Previous Stock)
  - "قسم" (Type/Item)
  - "سیری" (Serial)
- Row showing:
  - 0 | 0 | 0 | 0 | "سی جی" | 1
- Summary row:
  - 0 | 0 | 0 | 0 | "نقل سٹاک" (Net Stock)

#### 8.6.3 Functional Requirements

#### A. User Actions

**FR-STOCKRPT-001:** The system shall allow users to generate stock reports.

**FR-STOCKRPT-002:** The system shall allow users to specify the report date.

**FR-STOCKRPT-003:** The system shall allow users to generate the report via "Go" button.

**FR-STOCKRPT-004:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-STOCKRPT-005:** The system shall retrieve stock levels for all items as of the specified date.

**FR-STOCKRPT-006:** The system shall display item names in Urdu.

**FR-STOCKRPT-007:** The system shall display stock quantities in decimal format.

#### C. Validation & Constraints

**FR-STOCKRPT-008:** [Inferred] The system shall validate that report date is not in the future.

#### D. System Responses

**FR-STOCKRPT-009:** The system shall calculate previous stock (opening balance for the day).

**FR-STOCKRPT-010:** The system shall calculate today's purchases (sum of all purchases on the specified date).

**FR-STOCKRPT-011:** The system shall calculate today's sales (sum of all sales on the specified date).

**FR-STOCKRPT-012:** The system shall calculate remaining stock as (previous stock + purchases - sales).

**FR-STOCKRPT-013:** The system shall calculate total remaining stock across all items.

**FR-STOCKRPT-014:** The system shall display the report preview after clicking "Go".

**FR-STOCKRPT-015:** [Inferred] The system shall list items even if stock is zero for completeness.
#### F. Business Rules
**FR-STOCKRPT-019:** The system shall support weight-based inventory tracking (not unit-based).

---

### 8.7 Customer Register Report (Screenshot 18)

#### 8.7.1 Screen Identification

- **Screen Name:** Customer Account Register (رجسٹر کھاتہ رقم)
- **Purpose:** Generate customer account summary report

#### 8.7.2 UI Element Inventory

**Filter Section:**

- Date Picker: "Date" - Default: "03/ February /2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Title: "رجسٹر کھاتہ رقم" (Account Register)
- Date: "02.03.2026"
- Table with columns:
  - "باقیہ" (Balance)
  - "وصولی" (Collection)
  - "نقل رقم" (Net Amount)
  - "سابقہ" (Previous)
  - "نام" (Name)
  - "حقوق" (Serial/Rights)
  - "HBL" (appears to be a code/category)
- Row entries showing various amounts:
  - 71500 | 0.0 | 71500.0 | 0.0 | 71500 | HBL | 1
  - 493883 | 0.0 | 493883 | 0.0 | 493883 | لیف بسم اللہ خان | 2
  - (Multiple additional rows with similar data structure)
- Summary rows showing totals

#### 8.7.3 Functional Requirements

#### A. User Actions

**FR-CUSTREG-001:** The system shall allow users to generate customer account register reports.

**FR-CUSTREG-002:** The system shall allow users to specify the report date.

**FR-CUSTREG-003:** The system shall allow users to generate the report via "Go" button.

**FR-CUSTREG-004:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-CUSTREG-005:** The system shall retrieve account balances for all customers as of the specified date.

**FR-CUSTREG-006:** The system shall display customer names (in Urdu and/or English codes).

**FR-CUSTREG-007:** The system shall display amounts in decimal format with appropriate precision.

#### C. Validation & Constraints

**FR-CUSTREG-008:** [Inferred] The system shall validate that report date is not in the future.

#### D. System Responses

**FR-CUSTREG-009:** The system shall calculate previous balance (opening balance).

**FR-CUSTREG-010:** The system shall calculate net amount (current period charges).

**FR-CUSTREG-011:** The system shall calculate collections (payments received).

**FR-CUSTREG-012:** The system shall calculate remaining balance as (previous + net amount - collections).

**FR-CUSTREG-013:** The system shall calculate aggregate totals for all customers.

**FR-CUSTREG-014:** The system shall display the report preview after clicking "Go".

**FR-CUSTREG-015:** [Inferred] The system shall list all active customers regardless of balance.
#### F. Business Rules
**FR-CUSTREG-018:** [Inferred] The system shall highlight customers with outstanding balances.

**FR-CUSTREG-019:** The system shall support both Urdu names and English codes for customer identification.

---

### 8.8 Client Sales Discount Report (Screenshot 19)

#### 8.8.1 Screen Identification

- **Screen Name:** Client Sales Discount Report (رعایت رپورٹ)
- **Purpose:** Generate report of concessions/discounts granted to clients

#### 8.8.2 UI Element Inventory

**Filter Section:**

- Dropdown: "Client" - Default: "پڑک تاج حسن"
- Checkbox: "Check for All Clients"
- Date Picker: "From" - Default: "03/Feb/2026"
- Date Picker: "To" - Default: "03/Feb/2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 651-5534607"
- Title: "رعایت رپورٹ" (Concession Report)
- Date range: "تک 02-03-2026 سے 02-03-2026"
- Table with columns:
  - "تک" (Serial)
  - "رعایت" (Concession)
  - "فلیٹ" (Client)
  - "بکری نمبر" (Sale Number)
  - "تاریخ" (Date)

#### 8.8.3 Functional Requirements

#### A. User Actions

**FR-CONCESSIONRPT-001:** The system shall allow users to generate concession reports.

**FR-CONCESSIONRPT-002:** The system shall allow users to select a specific client for the report.

**FR-CONCESSIONRPT-003:** The system shall allow users to generate reports for all clients via checkbox.

**FR-CONCESSIONRPT-004:** The system shall allow users to specify a date range for the report.

**FR-CONCESSIONRPT-005:** The system shall allow users to generate the report via "Go" button.

**FR-CONCESSIONRPT-006:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-CONCESSIONRPT-007:** The system shall retrieve all sales transactions with concessions for the selected client(s) within the date range.

**FR-CONCESSIONRPT-008:** The system shall display transaction details including date, sale number, client, and concession amount.

#### C. Validation & Constraints

**FR-CONCESSIONRPT-009:** [Inferred] The system shall validate that "From" date is not later than "To" date.

**FR-CONCESSIONRPT-010:** [Inferred] The system shall disable client selection when "Check for All Clients" is checked.

#### D. System Responses

**FR-CONCESSIONRPT-011:** The system shall calculate total concessions granted.

**FR-CONCESSIONRPT-012:** The system shall display the report preview after clicking "Go".

**FR-CONCESSIONRPT-013:** [Inferred] The system shall exclude transactions with zero concession.

**FR-CONCESSIONRPT-014:** [Inferred] The system shall group by client when reporting for all clients.
#### F. Business Rules

**FR-CONCESSIONRPT-016:** The system shall include only sales transactions (not purchases) in the concession report.

---

### 8.9 Daily Sales Details Report (Screenshot 20)

#### 8.9.1 Screen Identification

- **Screen Name:** Daily Sales Details (امروزہ بکری)
- **Purpose:** Generate detailed daily sales report with line items

#### 8.9.2 UI Element Inventory

**Filter Section:**

- Date Picker: "تاریخ" (Date) - Default: "03/ February /2026"
- Button: "Go"

**Report Preview:**

- Header: "AL -SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-30985017 24, 051-5534607"
- Title: "امروزہ بکری" (Today's Sales)
- Date: "تاریخ 02-03-2026"
- Table with columns:
  - "رقم" (Amount)
  - "ریت (kg)" (Rate per kg)
  - "وزن (kg)" (Weight in kg)
  - "قسم" (Type/Item)
  - "فلیٹ" (Client)
  - "بیوپاری" (Supplier/Vendor)
  - "نمبر" (Number)
  - Row showing "1"
- Sub-section: "نقل" (Net/Total)

#### 8.9.3 Functional Requirements

#### A. User Actions

**FR-DAILYDETAIL-001:** The system shall allow users to generate detailed daily sales reports.

**FR-DAILYDETAIL-002:** The system shall allow users to specify the report date.

**FR-DAILYDETAIL-003:** The system shall allow users to generate the report via "Go" button.

**FR-DAILYDETAIL-004:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-DAILYDETAIL-005:** The system shall retrieve all sale line items for the specified date.

**FR-DAILYDETAIL-006:** The system shall display detailed line item information including client, supplier/vendor, item, weight, rate, and amount.

#### C. Validation & Constraints

**FR-DAILYDETAIL-007:** [Inferred] The system shall validate that report date is not in the future.

#### D. System Responses

**FR-DAILYDETAIL-008:** The system shall display each sale line item separately (not aggregated).

**FR-DAILYDETAIL-009:** The system shall calculate line amount as (weight × rate).

**FR-DAILYDETAIL-010:** The system shall calculate total sales for the day.

**FR-DAILYDETAIL-011:** The system shall display the report preview after clicking "Go".
#### F. Business Rules

**FR-DAILYDETAIL-013:** The system shall include all sales transactions for the specified date.

**FR-DAILYDETAIL-014:** The system shall display transactions in chronological order or grouped by sale number.

---

### 8.10 Supplier Sales Report (Screenshot 21)

#### 8.10.1 Screen Identification

- **Screen Name:** Supplier Sales Details (بیوپاری بکری)
- **Purpose:** Generate Supplier-wise sales report showing all sales linked to a specific supplier's stock

#### 8.10.2 UI Element Inventory

**Filter Section:**

- Dropdown: "بیوپاری" (Supplier) - Default: "All"
- Date Picker: "Sale Date From" - Default: "03/ February /2026"
- Date Picker: "Sale Date To" - Default: "03/ February /2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Contact: "+92-3008501724, 051-5534607"
- Title: "بیوپاری بکری" (Supplier Sales)
- Date range: "تاریخ 02-03-2026 سے 02-03-2026 تک"
- Table with columns:
  - "نمبر" (Number/Serial)
  - "گاہک" (Customer)
  - "گاڑی نمبر" (Vehicle Number)
  - "قسم" (Type/Item)
  - "ریٹ (kg)" (Rate per kg)
  - "وزن (kg)" (Weight in kg)
  - "رقم" (Amount)
- Row grouping: "بیوپاری" (Supplier) header row
- Summary row: "ٹوٹل گاڑیاں" (Total Vehicles)
- Footer: "ٹوٹل" (Total)

#### 8.10.3 Functional Requirements

#### A. User Actions

**FR-VENDORSALES-001:** The system shall allow users to generate Supplier-wise sales reports.

**FR-VENDORSALES-002:** The system shall allow users to filter by specific Supplier or select "All" suppliers.

**FR-VENDORSALES-003:** The system shall allow users to specify a date range for the report.

**FR-VENDORSALES-004:** The system shall allow users to generate the report via "Go" button.

**FR-VENDORSALES-005:** [Inferred] The system shall allow users to print the generated report.

**FR-VENDORSALES-006:** [Inferred] The system shall allow users to export the report.

#### B. Data Handling

**FR-VENDORSALES-007:** The system shall retrieve all sales transactions where items originated from the selected supplier's stock.

**FR-VENDORSALES-008:** The system shall display transaction details including customer, vehicle number, item type, weight, rate, and amount.

**FR-VENDORSALES-009:** The system shall group transactions by Supplier.

**FR-VENDORSALES-010:** The system shall display vehicle number count per supplier.

**FR-VENDORSALES-011:** The system shall track the relationship between purchased stock and subsequent sales.

#### C. Validation & Constraints

**FR-VENDORSALES-012:** [Inferred] The system shall validate that "Date From" is not later than "Date To".

#### D. System Responses

**FR-VENDORSALES-013:** The system shall calculate total weight sold per supplier.

**FR-VENDORSALES-014:** The system shall calculate total amount per supplier.

**FR-VENDORSALES-015:** The system shall count unique vehicles (گاڑیاں) used for each supplier's sales.

**FR-VENDORSALES-016:** The system shall calculate grand totals across all suppliers.

**FR-VENDORSALES-017:** The system shall display the report preview after clicking "Go".
#### F. Business Rules

**FR-VENDORSALES-019:** The system shall link sales transactions back to their original purchase source (supplier traceability).

**FR-VENDORSALES-020:** The system shall support tracking sales by the source vendor, enabling supplier performance analysis.

**FR-VENDORSALES-021:** [Inferred] The system shall calculate profit margin per supplier if purchase and sale rates are available.

---

### 8.11 Daily Net Amount Summary (Screenshot 22)

#### 8.11.1 Screen Identification

- **Screen Name:** Daily Net Amount Summary (رجسٹر ٹوٹل رقم)
- **Purpose:** Generate summary of total outstanding balances across all accounts

#### 8.11.2 UI Element Inventory

**Filter Section:**

- Date Picker: "Date" - Default: "03/ February /2026"
- Button: "Go"

**Report Preview:**

- Header: "AL - SHEIKH FISH TRADER AND DISTRIBUTER"
- Subheader: "Shop No. W-644 Gunj Mandi Rawalpindi"
- Title: "رجسٹر ٹوٹل رقم" (Register Total Amount)
- Date: "02.03.2026"
- Summary rows:
  - "تاریخ" (Date): 02-03-2026
  - "سابقہ" (Previous): 84,583,242.29
  - "امروزہ" (Today): 0.00
  - "ٹوٹل رقم" (Total Amount): 84,583,242.29
  - "وصولی" (Collection): 0.00
  - "بقایہ" (Balance): 84,583,242.29

#### 8.11.3 Functional Requirements

#### A. User Actions

**FR-NETSUMMARY-001:** The system shall allow users to generate daily net amount summary reports.

**FR-NETSUMMARY-002:** The system shall allow users to specify the report date.

**FR-NETSUMMARY-003:** The system shall allow users to generate the report via "Go" button.

**FR-NETSUMMARY-004:** [Inferred] The system shall allow users to print the generated report.

#### B. Data Handling

**FR-NETSUMMARY-005:** The system shall calculate the aggregate outstanding balance across all customer accounts.

**FR-NETSUMMARY-006:** The system shall display previous balance (carried forward from prior periods).

**FR-NETSUMMARY-007:** The system shall display today's transactions total.

**FR-NETSUMMARY-008:** The system shall display total collections received.

**FR-NETSUMMARY-009:** The system shall display final outstanding balance.

#### C. Validation & Constraints

**FR-NETSUMMARY-010:** [Inferred] The system shall validate that report date is not in the future.

#### D. System Responses

**FR-NETSUMMARY-011:** The system shall calculate سابقہ (Previous) as the sum of all account balances as of the previous day.

**FR-NETSUMMARY-012:** The system shall calculate امروزہ (Today) as the sum of all sales made on the specified date.

**FR-NETSUMMARY-013:** The system shall calculate ٹوٹل رقم (Total Amount) as (Previous + Today).

**FR-NETSUMMARY-014:** The system shall calculate وصولی (Collection) as the sum of all payments received on the specified date.

**FR-NETSUMMARY-015:** The system shall calculate بقایہ (Balance) as (Total Amount - Collection).

**FR-NETSUMMARY-016:** The system shall display the report preview after clicking "Go".

**FR-NETSUMMARY-017:** The system shall format large currency values with thousand separators.
#### F. Business Rules

**FR-NETSUMMARY-019:** The system shall provide a single-view snapshot of the entire receivables position.

**FR-NETSUMMARY-020:** The system shall enable day-end reconciliation by comparing Balance with actual cash collected.

**FR-NETSUMMARY-021:** [Inferred] The system shall support comparison of balances across multiple dates for trend analysis.

---

## 9. CROSS-CUTTING REQUIREMENTS

### 9.1 Localization and Language Support

**FR-LANG-001:** The system shall support Urdu (RTL - Right-to-Left) language for all user-facing text.

**FR-LANG-002:** The system shall support English language for labels, codes, and technical identifiers.

**FR-LANG-003:** The system shall render Urdu text using Unicode-compliant fonts.

**FR-LANG-004:** The system shall support mixed Urdu and English text within the same interface.

**FR-LANG-005:** The system shall maintain RTL text direction for Urdu content.

**FR-LANG-006:** The system shall maintain LTR text direction for English and numeric content.

**FR-LANG-007:** [Inferred] The system shall allow users to input text in both Urdu and English via keyboard.

**FR-LANG-008:** [Inferred] The system shall support Urdu-specific input methods (phonetic keyboard, InPage, etc.).

### 9.2 Data Types and Formats

**FR-DATA-001:** The system shall store and display amounts in decimal format with at least 2 decimal places.

**FR-DATA-002:** The system shall store and display weights in kilograms with decimal precision.

**FR-DATA-003:** The system shall use the format "DD-MM-YYYY" or "DD/Mon/YYYY" for date display.

**FR-DATA-004:** The system shall support date input via date picker controls.

**FR-DATA-005:** The system shall use Pakistani phone number format for mobile numbers (03XXXXXXXXX).

**FR-DATA-006:** The system shall use Pakistani NIC format (XXXXX-XXXXXXX-X).

**FR-DATA-007:** [Inferred] The system shall validate email addresses against standard email format.

**FR-DATA-008:** [Inferred] The system shall store currency amounts in a standard currency data type to prevent rounding errors.

### 9.3 Printing and Reporting

**FR-PRINT-001:** The system shall generate reports using SAP Crystal Reports engine.

**FR-PRINT-002:** The system shall include company header information on all printed documents.

**FR-PRINT-003:** The system shall include contact information on all printed documents.

**FR-PRINT-004:** The system shall support portrait and landscape orientations for reports.

**FR-PRINT-005:** The system shall support multi-page reports with pagination.

**FR-PRINT-006:** The system shall display page numbers on multi-page reports.

**FR-PRINT-007:** The system shall support print preview before sending to printer.

**FR-PRINT-008:** The system shall support zoom functionality in print preview.

**FR-PRINT-009:** [Inferred] The system shall support export to PDF format.

**FR-PRINT-010:** [Inferred] The system shall support export to Excel format.

**FR-PRINT-011:** [Inferred] The system shall support export to Word format.

**FR-PRINT-012:** The system shall render Urdu text correctly in all printed and exported documents.

### 9.4 Navigation and User Interface

**FR-NAV-001:** The system shall provide a consistent window title format showing module name and company name.

**FR-NAV-002:** The system shall provide Save, Clear, and Close buttons on all data entry forms.

**FR-NAV-003:** The system shall provide New, Save, Print, and Close buttons on all transaction entry forms.

**FR-NAV-004:** The system shall provide Print, Search, and Close buttons on all search forms.

**FR-NAV-005:** The system shall provide a main menu bar with File, Account, Account Reports, Inventory, Setup Management, Control Panel, Windows, and Help menus.

**FR-NAV-006:** [Inferred] The system shall support keyboard shortcuts for common actions.

**FR-NAV-007:** [Inferred] The system shall support tab navigation between form fields.

**FR-NAV-008:** [Inferred] The system shall provide visual indication of the currently focused field.

**FR-NAV-009:** [Inferred] The system shall provide consistent iconography across all modules.

### 9.5 Data Grid Behavior

**FR-GRID-001:** The system shall support inline editing in data grids for transaction line items.

**FR-GRID-002:** The system shall provide dropdown selection for reference data in grid cells.

**FR-GRID-003:** The system shall support row deletion via checkbox or delete button in grids.

**FR-GRID-004:** The system shall auto-calculate dependent fields as users enter data in grids.

**FR-GRID-005:** [Inferred] The system shall allow adding new rows to grids via "Add" or "New Line" button.

**FR-GRID-006:** [Inferred] The system shall support row selection for bulk operations.

**FR-GRID-007:** [Inferred] The system shall provide column headers in appropriate language (Urdu/English).

**FR-GRID-008:** [Inferred] The system shall support column resizing.

**FR-GRID-009:** [Inferred] The system shall support horizontal and vertical scrolling in large grids.

### 9.6 Data Integrity and Validation

**FR-VALID-001:** The system shall prevent saving of incomplete or invalid data.

**FR-VALID-002:** The system shall display validation errors in a user-friendly manner.

**FR-VALID-003:** The system shall highlight fields with validation errors.

**FR-VALID-004:** [Inferred] The system shall validate required fields before save.

**FR-VALID-005:** [Inferred] The system shall validate data types (numeric, date, text).

**FR-VALID-006:** [Inferred] The system shall validate business rules (e.g., sufficient stock).

**FR-VALID-007:** [Inferred] The system shall prevent duplicate key violations.

**FR-VALID-008:** [Inferred] The system shall maintain referential integrity between related tables.

**FR-VALID-009:** [Inferred] The system shall use database transactions to ensure data consistency.

**FR-VALID-010:** [Inferred] The system shall rollback changes if any part of a multi-step operation fails.

### 9.7 System Administration

**FR-ADMIN-001:** [Inferred] The system shall provide configuration settings for company information.

**FR-ADMIN-002:** [Inferred] The system shall provide backup and restore functionality.

**FR-ADMIN-003:** [Inferred] The system shall log system errors for troubleshooting.

**FR-ADMIN-004:** [Inferred] The system shall provide database maintenance utilities.

**FR-ADMIN-005:** [Inferred] The system shall support configuration of business rules (e.g., tax rates, default values).

**FR-ADMIN-006:** [Inferred] The system shall allow customization of report headers and footers.

---

## 10. AMBIGUOUS AREAS AND CLARIFICATION NEEDED

### 10.1 Areas Requiring Clarification

**[AMBIGUOUS-001]** The distinction between "Supplier" (supplier) and "Client"/"Customer" needs clarification in some screens (e.g., Sale screen shows "بیوپاری" which typically means supplier).

**[AMBIGUOUS-002]** The exact calculation formula for supplier bills is not entirely clear from the UI (are commission, grocery, labor, ice added or subtracted?).

**[AMBIGUOUS-003]** The stock management system appears weight-based, but it's unclear if the system supports multiple units of measure or quantity-based tracking for non-weight items.

**[AMBIGUOUS-004]** The relationship between "Vehicle Number" and transactions is not clear (is this for delivery tracking, or supplier/client identification?).

**[AMBIGUOUS-005]** The "Previous Amount" (سانقہ رقم) field in purchase entry - is this automatically retrieved from the ledger or manually entered?

**[AMBIGUOUS-006]** The distinction between "نقد" (cash) and "نقل" (which also appears to mean cash/net) needs clarification.

**[AMBIGUOUS-007]** Whether the system supports returns, refunds, or reverse transactions is not evident from the screenshots.

**[AMBIGUOUS-008]** Multi-currency support is not evident - system appears to use a single currency (Pakistani Rupees assumed).
**[AMBIGUOUS-010]** Integration with external systems (accounting, ERP, e-commerce) is not evident from the screenshots.

### 10.2 Inferred Business Rules Requiring Validation

**[INFERRED-RULE-001]** Sale transactions reduce inventory and increase customer account balance.

**[INFERRED-RULE-002]** Purchase transactions increase inventory and increase supplier account balance (payable).

**[INFERRED-RULE-003]** Cash payments reduce customer account balance.

**[INFERRED-RULE-004]** Payments to suppliers reduce supplier account balance (payable).

**[INFERRED-RULE-005]** Concession/Discount reduces the payable/receivable amount.

**[INFERRED-RULE-006]** Commission, labor, ice, and grocery charges are deducted from supplier payments.

---

## 11. DATA MODEL CONSIDERATIONS

### 11.1 Core Entities

Based on the UI analysis, the following core entities are identified for the data model:

| Entity               | Description                      | Key Fields                                                                                                                                       |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Supplier**         | Vendors who supply fish stock    | ID, Name (Urdu), NIC, Phone, Mobile, Email, City, Country, Address, Balance                                                                      |
| **Customer**         | Buyers/clients who purchase fish | ID, Name (Urdu), Name (English), NIC, Phone, Mobile, Email, City, Country, Address, Balance                                                      |
| **Item**             | Fish types/products              | ID, Name (Urdu), Unit Price, Category                                                                                                            |
| **Category**         | Item classification              | ID, Name                                                                                                                                         |
| **City**             | Location reference               | ID, Name                                                                                                                                         |
| **Country**          | Location reference               | ID, Name                                                                                                                                         |
| **Sale**             | Header for sale transactions     | ID, Sale Number, Customer ID, Vehicle Number, Sale Date, Details, Total Amount                                                                   |
| **SaleLineItem**     | Line items within a sale         | ID, Sale ID, Item ID, Weight, Tare Weight, Rate, Amount, Grocery, Ice, Cash, Receipt                                                             |
| **Purchase**         | Header for purchase transactions | ID, Purchase Number, Supplier ID, Purchase Date, Details, Total Amount, Concession, Cash Paid                                                    |
| **PurchaseLineItem** | Line items within a purchase     | ID, Purchase ID, Item ID, Weight, Rate, Amount                                                                                                   |
| **SupplierBill**     | Periodic supplier billing        | ID, Supplier ID, Date From, Date To, Total Weight, Gross Amount, Commission %, Commission, Grocery, Labor, Ice, Concession, Cash, Payable Amount |

### 11.2 Relationship Mapping

```
Supplier (1) ─────────┬───── (M) Purchase
                      └───── (M) SupplierBill

Customer (1) ────────────── (M) Sale

Item (1) ────────────┬───── (M) SaleLineItem
                     └───── (M) PurchaseLineItem

Sale (1) ───────────────── (M) SaleLineItem

Purchase (1) ───────────── (M) PurchaseLineItem

Category (1) ──────────── (M) Item

City (1) ──────────┬───── (M) Supplier
                   └───── (M) Customer

Country (1) ───────┬───── (M) Supplier
                   └───── (M) Customer
```

### 11.3 Key Data Types

| Data Type  | Format        | Example         | Usage                            |
| ---------- | ------------- | --------------- | -------------------------------- |
| Currency   | Decimal(15,2) | 84,583,242.29   | All monetary amounts             |
| Weight     | Decimal(10,3) | 25.500          | Weights in kilograms             |
| Rate       | Decimal(10,2) | 150.00          | Price per kilogram               |
| Percentage | Decimal(5,2)  | 5.50            | Commission, discount percentages |
| NIC        | VARCHAR(15)   | XXXXX-XXXXXXX-X | Pakistani National ID format     |
| Mobile     | VARCHAR(11)   | 03XXXXXXXXX     | Pakistani mobile format          |
| Date       | DATE          | 2026-02-03      | Transaction dates                |
| Urdu Text  | NVARCHAR      | متن اردو        | All Urdu language fields         |

### 11.4 Stock Calculation Logic

**FR-DATAMODEL-001:** Stock levels shall be calculated dynamically based on:

```
Current Stock = Opening Stock + Total Purchases - Total Sales
```

**FR-DATAMODEL-002:** The system shall track stock per item using weight (kg) as the unit of measure.
---

## 12. ADDITIONAL INFERRED REQUIREMENTS

### 12.1 Error Handling

**FR-ERROR-001:** [Inferred] The system shall display user-friendly error messages in Urdu and/or English.

**FR-ERROR-002:** [Inferred] The system shall log all system errors with timestamps and user context.

**FR-ERROR-003:** [Inferred] The system shall prevent data loss during unexpected errors by implementing transaction rollback.

**FR-ERROR-004:** [Inferred] The system shall display validation errors immediately upon field exit or form submission.

**FR-ERROR-005:** [Inferred] The system shall highlight fields with validation errors using visual cues (red border, icon).

### 12.2 Performance Requirements

**FR-PERF-001:** [Inferred] The system shall load dashboard within 3 seconds under normal conditions.

**FR-PERF-002:** [Inferred] The system shall complete search operations within 5 seconds.

**FR-PERF-003:** [Inferred] The system shall generate reports within 10 seconds for standard date ranges.

**FR-PERF-004:** [Inferred] The system shall support pagination for large result sets (>100 records).

### 12.3 Backup & Recovery

**FR-BACKUP-001:** [Inferred] The system shall support database backup functionality.

**FR-BACKUP-002:** [Inferred] The system shall support database restore functionality.

**FR-BACKUP-003:** [Inferred] The system shall log backup operations for audit purposes.

### 12.4 Year-End Processing

**FR-YEAREND-001:** [Inferred] The system shall support year-end closing of accounts.

**FR-YEAREND-002:** [Inferred] The system shall carry forward outstanding balances to the new year.

**FR-YEAREND-003:** [Inferred] The system shall archive historical data while maintaining accessibility.

---

## 13. SCREENSHOT TO REQUIREMENT MAPPING

| Screenshot # | Timestamp   | Screen Name                      | Section Reference |
| ------------ | ----------- | -------------------------------- | ----------------- |
| 1            | 10.15.47 PM | Main Dashboard                   | Section 1         |
| 2            | 10.16.19 PM | Supplier Entry Form              | Section 2.1       |
| 3            | 10.16.37 PM | Manage Clients (Supplier Search) | Section 2.2       |
| 4            | 10.16.59 PM | Client Entry Form                | Section 3.1       |
| 5            | 10.17.19 PM | Supplier Bill Report             | Section 4.1       |
| 6            | 10.17.57 PM | Supplier Stock Bill Report       | Section 4.1       |
| 7            | 10.18.14 PM | Items Entry Form                 | Section 5.1       |
| 8            | 10.18.31 PM | Sale Transaction Entry           | Section 6.1       |
| 9            | 10.18.46 PM | Sale Search (Inventory Sale)     | Section 6.2       |
| 10           | 10.19.18 PM | Purchase Transaction Entry       | Section 7.1       |
| 11           | 10.19.36 PM | Purchase Search                  | Section 7.2       |
| 12           | 10.19.53 PM | Client Recovery Report           | Section 8.1       |
| 13           | 10.20.16 PM | Item Sale Report                 | Section 8.2       |
| 14           | 10.20.34 PM | Daily Sales Report               | Section 8.3       |
| 15           | 10.20.51 PM | Account Ledger                   | Section 8.4       |
| 16           | 10.21.07 PM | Item Purchase Report             | Section 8.5       |
| 17           | 10.21.29 PM | Stock Report                     | Section 8.6       |
| 18           | 10.21.48 PM | Customer Register Report         | Section 8.7       |
| 19           | 10.22.03 PM | Client Sales Discount Report     | Section 8.8       |
| 20           | 10.22.19 PM | Daily Sales Details Report       | Section 8.9       |
| 21           | 10.22.35 PM | Supplier Sales Report              | Section 8.10      |
| 22           | 10.23.07 PM | Daily Net Amount Summary         | Section 8.11      |

---

## 14. REQUIREMENTS SUMMARY

### 14.1 Requirements Count by Module

| Module                 | Explicit Requirements | Inferred Requirements | Total   |
| ---------------------- | --------------------- | --------------------- | ------- |
| Dashboard              | 15                    | 12                    | 27      |
| Supplier Management    | 22                    | 9                     | 31      |
| Customer Management    | 22                    | 9                     | 31      |
| Supplier Bill          | 28                    | 10                    | 38      |
| Item Management        | 16                    | 9                     | 25      |
| Sales                  | 42                    | 16                    | 58      |
| Purchase               | 34                    | 12                    | 46      |
| Reporting (12 reports) | 95                    | 45                    | 140     |
| Cross-Cutting          | 28                    | 32                    | 60      |
| Data Model             | 3                     | 0                     | 3       |
| Additional Inferred    | 0                     | 21                    | 21      |
| **TOTAL**              | **305**               | **175**               | **480** |

### 14.2 Priority Classification

**P1 - Core Transaction Processing:**

- Sale entry and search
- Purchase entry and search
- Customer and supplier management
- Stock tracking

**P2 - Financial Reporting:**

- Ledger
- Customer register
- Daily sales reports
- Supplier billing

**P3 - Analytics & Advanced:**

- Item-wise reports
- Supplier sales analysis
- Profit margin calculations
- SMS notifications

### 14.3 Document Revision History

| Version | Date       | Author       | Changes                                                                                                               |
| ------- | ---------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-02-04 | BA Team      | Initial extraction from screenshots                                                                                   |
| 1.1     | 2026-02-06 | AI Assistant | Added Supplier Sales Report, Daily Net Amount Summary, Data Model, Additional Inferred Requirements, Screenshot Mapping |

---

**END OF DOCUMENT**
