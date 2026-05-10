# Create root src1
mkdir src1

# app
mkdir src1/app/routes
mkdir src1/app/providers
mkdir src1/app/store
mkdir src1/app/config


# features - auth
mkdir src1/features/auth/components
mkdir src1/features/auth/pages
mkdir src1/features/auth/services
mkdir src1/features/auth/hooks
mkdir src1/features/auth/types
mkdir src1/features/auth/utils
New-Item src1/features/auth/index.js -ItemType File

# features - leads
mkdir src1/features/leads/components
mkdir src1/features/leads/pages
mkdir src1/features/leads/services
mkdir src1/features/leads/hooks
mkdir src1/features/leads/types
mkdir src1/features/leads/utils
New-Item src1/features/leads/index.js -ItemType File

# features - vendors
mkdir src1/features/vendors/components
mkdir src1/features/vendors/pages
mkdir src1/features/vendors/services
mkdir src1/features/vendors/hooks
mkdir src1/features/vendors/types
New-Item src1/features/vendors/index.js -ItemType File

# features - subscriptions
mkdir src1/features/subscriptions/components
mkdir src1/features/subscriptions/pages
mkdir src1/features/subscriptions/services
mkdir src1/features/subscriptions/hooks
mkdir src1/features/subscriptions/types
New-Item src1/features/subscriptions/index.js -ItemType File

# features - access-control
mkdir src1/features/access-control/components
mkdir src1/features/access-control/hooks
mkdir src1/features/access-control/services
mkdir src1/features/access-control/utils
New-Item src1/features/access-control/index.js -ItemType File

# shared
mkdir src1/shared/components
mkdir src1/shared/hooks
mkdir src1/shared/services
mkdir src1/shared/utils
mkdir src1/shared/types
mkdir src1/shared/constants

# layouts & styles
mkdir src1/layouts
mkdir src1/styles