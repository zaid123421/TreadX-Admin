# Address Module Analysis: API Flow for Leads

This document outlines the API flow for retrieving and submitting address information (Country, State, City) within the **Address Module**, specifically for use in the **Create/Edit Lead** functionality.

## Overview

The system uses a hierarchical address structure: **Country > State (Province) > City**. 
- The frontend retrieves lists of these entities using "base" endpoints to populate dropdown menus.
- The UI displays the `name` of each entity to the user.
- Upon form submission (POST/PUT), only the corresponding `id` for each entity is sent to the backend.

---

## 1. Fetching Address Data (Dropdown Population)

The following endpoints are used to fetch the hierarchical address data. Each returns an **array** of objects.

### Step A: Get All Countries
Fetch the initial list of countries to start the address selection.
- **Endpoint**: `GET /api/v1/addresses/base/countries`
- **Response Type**: `List<CountryResponseDTO>`
- **Response Structure**:
  ```json
  [
    {
      "id": 1,
      "name": "United States",
      "iso3": "USA",
      "latitude": 37.09024,
      "longitude": -95.712891
    },
    ...
  ]
  ```

### Step B: Get States by Country
Triggered when a user selects a country.
- **Endpoint**: `GET /api/v1/addresses/base/countries/{countryId}/provinces`
- **Path Parameter**: `{countryId}` (the `id` from Step A)
- **Response Type**: `List<StateResponseDTO>`
- **Response Structure**:
  ```json
  [
    {
      "id": 10,
      "name": "California",
      "stateCode": "CA",
      "latitude": 36.778261,
      "longitude": -119.417932
    },
    ...
  ]
  ```

### Step C: Get Cities by State
Triggered when a user selects a state/province.
- **Endpoint**: `GET /api/v1/addresses/base/provinces/{stateId}/cities`
- **Path Parameter**: `{stateId}` (the `id` from Step B)
- **Response Type**: `List<CityResponseDTO>`
- **Response Structure**:
  ```json
  [
    {
      "id": 100,
      "name": "Los Angeles",
      "latitude": 34.052234,
      "longitude": -118.243685
    },
    ...
  ]
  ```

---

## 2. Submitting Address Data (Create/Edit Lead)

When creating or editing a lead, the selected IDs are bundled into the `address` object within the lead request.

### Lead Submission Payload
- **Endpoint**: `POST /api/v1/leads` (or `PUT /api/v1/leads/{id}`)
- **Request Body Snippet** (`LeadsRequestDTO`):
  ```json
  {
    "businessName": "Example Business",
    "phoneNumber": "+1234567890",
    "address": {
      "streetName": "Main St",
      "streetNumber": "123",
      "postalCode": "90210",
      "unitNumber": "A1",
      "countryId": 1,      // ID from Step A
      "stateId": 10,       // ID from Step B
      "cityId": 100        // ID from Step C
    },
    "source": "WEB_FORM",
    "status": "NEW"
  }
  ```

---

## 3. Key Components Summary

| Component | Purpose |
| :--- | :--- |
| **AddressController** | Defines the `/base/` endpoints for hierarchical lookup. |
| **AddressService** | Orchestrates the retrieval from `CountryRepository`, `StateRepository`, and `CityRepository`. |
| **AddressRequestDTO** | The data structure used for POST/PUT requests, requiring `cityId`, `stateId`, and `countryId`. |
| **LeadRequestDTO** | Contains the `AddressRequestDTO` as a nested object for Lead creation. |

---

## Technical Flow Diagram (Cursor/Dev Flow)

1. **Initialize Form**: Call `/api/v1/addresses/base/countries`.
2. **User selects Country**: 
   - Store `selectedCountryId`.
   - Call `/api/v1/addresses/base/countries/${selectedCountryId}/provinces`.
3. **User selects State**:
   - Store `selectedStateId`.
   - Call `/api/v1/addresses/base/provinces/${selectedStateId}/cities`.
4. **User selects City**:
   - Store `selectedCityId`.
5. **Final POST**: Send all stored IDs (`countryId`, `stateId`, `cityId`) along with text fields (street, postal code) in the `address` field of the Lead object.
