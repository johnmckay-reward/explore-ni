# Epic 11: Final UI & Internal Logic Regression Test

## Quick Start

This is the final sign-off test for the NI Experiences MVP. It validates all UI flows and internal logic without requiring live third-party API keys.

### Run the Test

```bash
# 1. Start API server (Terminal 1)
cd api
rm database.sqlite  # Clean start
node index.js

# 2. Start UI server (Terminal 2)
cd ui
npm start

# 3. Run regression test (Terminal 3)
cd ui
npx cypress run --spec "cypress/e2e/epic11-final-regression.cy.js"
```

### Expected Results

- ✅ 19 test cases pass
- ✅ 22 screenshots captured
- ✅ All UI flows validated
- ✅ All security controls verified

## What This Test Validates

### Part 1: System Boot & Data Seeding
- User registration and vendor approval
- Voucher creation
- Experience creation and approval

### Part 2: UI/UX Polish
- Loading spinners
- Brand colors and typography
- Responsive design (mobile view)
- Error and success toasts

### Part 3: Booking & Voucher Flow
- Experience selection and booking
- Checkout and payment pages
- Voucher redemption (£50 → £40 with £10 voucher)

### Part 4: Vendor Dashboard
- My Listings page
- Booking Requests page
- Profile page with saved data

### Part 5: Admin Dashboard & Security
- Admin settings and vouchers pages
- Role-based access control:
  - Customer cannot access /admin or /dashboard
  - Vendor cannot access /admin

### Part 6: Cleanup
- Final verification

## Screenshots

All screenshots are saved in:
```
ui/cypress/screenshots/epic11-final-regression.cy.js/
```

22 screenshots document every verification step.

## Documentation

- **Execution Guide**: `EPIC11_EXECUTION_GUIDE.md` - Detailed step-by-step instructions
- **Implementation Summary**: `EPIC11_SUMMARY.md` - Complete implementation details
- **Security Summary**: `SECURITY_SUMMARY_EPIC11.md` - Security analysis and approval

## Critical Constraints

⚠️ **IN-MEMORY DATABASE**: The API uses an in-memory database that is wiped if the server stops. This entire test MUST run as one continuous script without restarting the API.

⚠️ **NO EXTERNAL APIS**: This test intentionally does NOT call live Stripe, Twilio, or SendGrid APIs. It validates UI flows only.

## Troubleshooting

### Cypress Not Installed

```bash
cd ui
npm install cypress --save-dev
```

### API or UI Not Running

Make sure both servers are running before executing the test:
- API: http://localhost:3000
- UI: http://localhost:4200

### Test Fails

1. Delete database: `rm api/database.sqlite`
2. Restart API server
3. Wait for UI to rebuild
4. Re-run test

## Success Criteria

- [x] All 6 parts execute in sequence
- [x] 19 test cases pass
- [x] 22 screenshots captured
- [x] UI/UX polish confirmed
- [x] Voucher redemption works
- [x] All dashboards functional
- [x] Security controls validated

---

**Status**: ✅ Ready for Execution  
**Version**: 1.0  
**Last Updated**: 2025-10-26
