# FreeMarket Indexes

| Table | Index Name | Fields | Index Type |
|:------|:-----------|:-------|:-----------|
| auth_group | auth_group_name_a6ea08ec_like | name varchar_pattern_ops | BTREE |
| auth_group | auth_group_name_key | name | BTREE |
| auth_group | auth_group_pkey | id | BTREE |
| auth_group_permissions | auth_group_permissions_group_id_b120cbf9 | group_id | BTREE |
| auth_group_permissions | auth_group_permissions_group_id_permission_id_0cd325b0_uniq | group_id, permission_id | BTREE |
| auth_group_permissions | auth_group_permissions_permission_id_84c5c92e | permission_id | BTREE |
| auth_group_permissions | auth_group_permissions_pkey | id | BTREE |
| auth_permission | auth_permission_content_type_id_2f476e4b | content_type_id | BTREE |
| auth_permission | auth_permission_content_type_id_codename_01ab375a_uniq | content_type_id, codename | BTREE |
| auth_permission | auth_permission_pkey | id | BTREE |
| base_address | base_address_pkey | id | BTREE |
| base_address | base_address_user_id_e49b63cc | user_id | BTREE |
| base_cart | base_cart_pkey | id | BTREE |
| base_cart | base_cart_user_id_key | user_id | BTREE |
| base_cartactivitylog | base_cartactivitylog_cart_id_b68cf88c | cart_id | BTREE |
| base_cartactivitylog | base_cartactivitylog_item_id_8bca1f69 | item_id | BTREE |
| base_cartactivitylog | base_cartactivitylog_pkey | id | BTREE |
| base_cartactivitylog | base_cartactivitylog_user_id_06ef36b5 | user_id | BTREE |
| base_cartitem | base_cartitem_cart_id_4f5a40cd | cart_id | BTREE |
| base_cartitem | base_cartitem_item_id_3f016c53 | item_id | BTREE |
| base_cartitem | base_cartitem_pkey | id | BTREE |
| base_cartitem | idx_cartitem_cart | cart_id | BTREE |
| base_cartitem | idx_cartitem_item | item_id | BTREE |
| base_cartitem | unique_cart_item | cart_id, item_id | BTREE |
| base_category | base_category_parent_id_42ca2e66 | parent_id | BTREE |
| base_category | base_category_pkey | id | BTREE |
| base_customuser | base_customuser_pkey | id | BTREE |
| base_customuser | base_customuser_username_e2c38001_like | username varchar_pattern_ops | BTREE |
| base_customuser | base_customuser_username_key | username | BTREE |
| base_customuser | idx_user_dob | date_of_birth | BTREE |
| base_customuser_groups | base_customuser_groups_customuser_id_04d7166b | customuser_id | BTREE |
| base_customuser_groups | base_customuser_groups_customuser_id_group_id_d4e28d0b_uniq | customuser_id, group_id | BTREE |
| base_customuser_groups | base_customuser_groups_group_id_d1822349 | group_id | BTREE |
| base_customuser_groups | base_customuser_groups_pkey | id | BTREE |
| base_customuser_user_permissions | base_customuser_user_per_customuser_id_permission_90414b11_uniq | customuser_id, permission_id | BTREE |
| base_customuser_user_permissions | base_customuser_user_permissions_customuser_id_4f46199a | customuser_id | BTREE |
| base_customuser_user_permissions | base_customuser_user_permissions_permission_id_e62eddd3 | permission_id | BTREE |
| base_customuser_user_permissions | base_customuser_user_permissions_pkey | id | BTREE |
| base_item | base_item_pkey | id | BTREE |
| base_item | base_item_seller_id_304852fd | seller_id | BTREE |
| base_item | base_item_slug_9484d41c_like | slug varchar_pattern_ops | BTREE |
| base_item | base_item_slug_key | slug | BTREE |
| base_item | gin_item_metadata | metadata | GIN |
| base_item | gin_item_search_vector | search_vector | GIN |
| base_item | idx_item_created_at | created_at | BTREE |
| base_item | idx_item_currency | currency | BTREE |
| base_item | idx_item_is_deleted | is_deleted | BTREE |
| base_item | idx_item_name | name | BTREE |
| base_item | idx_item_price | price_cents | BTREE |
| base_item | idx_item_seller | seller_id | BTREE |
| base_item | idx_item_slug | slug | BTREE |
| base_itemcategory | base_itemcategory_category_id_23daba46 | category_id | BTREE |
| base_itemcategory | base_itemcategory_item_id_960bfceb | item_id | BTREE |
| base_itemcategory | base_itemcategory_pkey | id | BTREE |
| base_itemcategory | unique_item_category | item_id, category_id | BTREE |
| base_order | base_order_pkey | id | BTREE |
| base_order | base_order_user_id_8ad0adec | user_id | BTREE |
| base_order | gin_order_metadata | metadata | GIN |
| base_orderitem | base_orderitem_item_id_4f262f75 | item_id | BTREE |
| base_orderitem | base_orderitem_order_id_aaa7f08a | order_id | BTREE |
| base_orderitem | base_orderitem_pkey | id | BTREE |
| base_payment | base_payment_order_id_36fcd8b6 | order_id | BTREE |
| base_payment | base_payment_pkey | id | BTREE |
| base_payment | base_payment_transaction_id_e46a7f82_like | transaction_id varchar_pattern_ops | BTREE |
| base_payment | base_payment_transaction_id_key | transaction_id | BTREE |
| base_product | base_product_pkey | item_ptr_id | BTREE |
| base_sellerapplication | base_sellerapplication_pkey | id | BTREE |
| base_sellerapplication | base_sellerapplication_reviewer_id_1b6685c0 | reviewer_id | BTREE |
| base_sellerapplication | base_sellerapplication_user_id_58cd3c4c | user_id | BTREE |
| base_sellerapplication | unique_active_seller_application | user_id | BTREE |
| base_sellerprofile | base_sellerprofile_pkey | id | BTREE |
| base_sellerprofile | base_sellerprofile_slug_93ae9d87_like | slug varchar_pattern_ops | BTREE |
| base_sellerprofile | base_sellerprofile_slug_key | slug | BTREE |
| base_sellerprofile | base_sellerprofile_user_id_key | user_id | BTREE |
| base_service | base_service_pkey | item_ptr_id | BTREE |
| base_useractivitylog | base_useractivitylog_pkey | id | BTREE |
| base_useractivitylog | base_useractivitylog_user_id_a2ac241d | user_id | BTREE |
| base_useractivitylog | idx_log_action | action | BTREE |
| base_useractivitylog | idx_log_timestamp | created_at | BTREE |
| base_useractivitylog | idx_log_user | user_id | BTREE |
| django_admin_log | django_admin_log_content_type_id_c4bce8eb | content_type_id | BTREE |
| django_admin_log | django_admin_log_pkey | id | BTREE |
| django_admin_log | django_admin_log_user_id_c564eba6 | user_id | BTREE |
| django_content_type | django_content_type_app_label_model_76bd3d3b_uniq | app_label, model | BTREE |
| django_content_type | django_content_type_pkey | id | BTREE |
| django_migrations | django_migrations_pkey | id | BTREE |
| django_session | django_session_expire_date_a5c62663 | expire_date | BTREE |
| django_session | django_session_pkey | session_key | BTREE |
| django_session | django_session_session_key_c0390e0f_like | session_key varchar_pattern_ops | BTREE |
| token_blacklist_blacklistedtoken | token_blacklist_blacklistedtoken_pkey | id | BTREE |
| token_blacklist_blacklistedtoken | token_blacklist_blacklistedtoken_token_id_key | token_id | BTREE |
| token_blacklist_outstandingtoken | token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_like | jti varchar_pattern_ops | BTREE |
| token_blacklist_outstandingtoken | token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq | jti | BTREE |
| token_blacklist_outstandingtoken | token_blacklist_outstandingtoken_pkey | id | BTREE |
| token_blacklist_outstandingtoken | token_blacklist_outstandingtoken_user_id_83bc629a | user_id | BTREE |
