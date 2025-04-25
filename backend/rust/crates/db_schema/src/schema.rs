// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::query_builder::QueryId, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "entity_type"))]
    pub struct EntityType;

    #[derive(diesel::query_builder::QueryId, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "payment_status"))]
    pub struct PaymentStatus;
}

diesel::table! {
    fr_token_plans (id) {
        id -> Uuid,
        #[max_length = 255]
        name -> Varchar,
        #[max_length = 500]
        description -> Varchar,
        fr_tokens -> Int4,
        price -> Int8,
        price_per_fr_token -> Int2,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::EntityType;

    images (id) {
        id -> Uuid,
        user_id -> Uuid,
        entity_id -> Uuid,
        entity_type -> EntityType,
        #[max_length = 50]
        content_type -> Varchar,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    login_tokens (user_id) {
        user_id -> Uuid,
        #[max_length = 300]
        token_hash -> Varchar,
        #[max_length = 20]
        ip -> Varchar,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    oauth_accounts (oauth_user_id) {
        #[max_length = 50]
        oauth_user_id -> Varchar,
        user_id -> Uuid,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::PaymentStatus;

    payment_history (id) {
        id -> Uuid,
        fr_token_id -> Uuid,
        user_id -> Uuid,
        price -> Int8,
        fr_tokens -> Int4,
        status -> PaymentStatus,
        #[max_length = 100]
        transaction_id -> Varchar,
        #[max_length = 100]
        session_id -> Varchar,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    pending_users (id) {
        id -> Uuid,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 300]
        password_hash -> Nullable<Varchar>,
        #[max_length = 300]
        token -> Varchar,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    permissions (id) {
        id -> Uuid,
        #[max_length = 50]
        name -> Varchar,
        #[max_length = 50]
        resource -> Varchar,
        #[max_length = 50]
        action -> Varchar,
    }
}

diesel::table! {
    role_permissions (role_id, permission_id) {
        role_id -> Uuid,
        permission_id -> Uuid,
    }
}

diesel::table! {
    roles (id) {
        id -> Uuid,
        #[max_length = 50]
        name -> Varchar,
        #[max_length = 255]
        description -> Varchar,
    }
}

diesel::table! {
    user_roles (user_id, role_id) {
        user_id -> Uuid,
        role_id -> Uuid,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        #[max_length = 255]
        name -> Varchar,
        #[max_length = 255]
        email -> Varchar,
        #[max_length = 300]
        avatar_url -> Varchar,
        #[max_length = 300]
        password_hash -> Nullable<Varchar>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    wallets (id) {
        id -> Uuid,
        user_id -> Uuid,
        fr_tokens -> Int4,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::joinable!(images -> users (user_id));
diesel::joinable!(login_tokens -> users (user_id));
diesel::joinable!(oauth_accounts -> users (user_id));
diesel::joinable!(payment_history -> fr_token_plans (fr_token_id));
diesel::joinable!(payment_history -> users (user_id));
diesel::joinable!(role_permissions -> permissions (permission_id));
diesel::joinable!(role_permissions -> roles (role_id));
diesel::joinable!(user_roles -> roles (role_id));
diesel::joinable!(user_roles -> users (user_id));
diesel::joinable!(wallets -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    fr_token_plans,
    images,
    login_tokens,
    oauth_accounts,
    payment_history,
    pending_users,
    permissions,
    role_permissions,
    roles,
    user_roles,
    users,
    wallets,
);
