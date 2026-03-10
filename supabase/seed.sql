SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 4lwZ0EJv0WEJ1xMgJv3bk2a3Ja0scmg7OE5zfzA1djfshckGI8t68m7hitpdEug

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'a6a58204-ac82-4842-b07f-41e98aa21198', '{"action":"user_signedup","actor_id":"5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf","actor_username":"test@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-02-22 22:28:45.87654+00', ''),
	('00000000-0000-0000-0000-000000000000', '405571c0-bcf1-4a6e-b8b5-a2cb2b0f8327', '{"action":"login","actor_id":"5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-02-22 22:28:45.8856+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b2061b3-6336-4e77-a158-8a36f4123b63', '{"action":"login","actor_id":"5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-02-22 22:28:45.959635+00', ''),
	('00000000-0000-0000-0000-000000000000', '5dd20d33-6b5e-433a-9156-520f9d56f105', '{"action":"user_signedup","actor_id":"84b4f798-0447-4230-86db-6a2d45858e86","actor_username":"raz@dogfoodlab.io","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-02-22 22:29:50.907946+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd1d3f97f-e12f-4212-be0f-17d69ee0ba1f', '{"action":"login","actor_id":"84b4f798-0447-4230-86db-6a2d45858e86","actor_username":"raz@dogfoodlab.io","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-02-22 22:29:50.914745+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', 'authenticated', 'authenticated', 'test@example.com', '$2a$10$E64jpESReyckRZi.UFmsl.7xfwTN982s3TB/ORqp4v8xuD/ecdY1e', '2026-02-22 22:28:45.877156+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-22 22:28:45.960363+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf", "email": "test@example.com", "email_verified": true, "phone_verified": false}', NULL, '2026-02-22 22:28:45.871016+00', '2026-02-22 22:28:45.961859+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '84b4f798-0447-4230-86db-6a2d45858e86', 'authenticated', 'authenticated', 'raz@dogfoodlab.io', '$2a$10$hyF3u3o41aMfMFJKJE8Yi.fSN9y0Wt8UtfygmVPz2MgaLoaCBZFeS', '2026-02-22 22:29:50.908564+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-22 22:29:50.915439+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "84b4f798-0447-4230-86db-6a2d45858e86", "email": "raz@dogfoodlab.io", "email_verified": true, "phone_verified": false}', NULL, '2026-02-22 22:29:50.901932+00', '2026-02-22 22:29:50.917897+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', '{"sub": "5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf", "email": "test@example.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-22 22:28:45.875046+00', '2026-02-22 22:28:45.875061+00', '2026-02-22 22:28:45.875061+00', '0c9bb1b3-bf1d-4e5e-a6d4-d55d6b9491f3'),
	('84b4f798-0447-4230-86db-6a2d45858e86', '84b4f798-0447-4230-86db-6a2d45858e86', '{"sub": "84b4f798-0447-4230-86db-6a2d45858e86", "email": "raz@dogfoodlab.io", "email_verified": false, "phone_verified": false}', 'email', '2026-02-22 22:29:50.906322+00', '2026-02-22 22:29:50.906342+00', '2026-02-22 22:29:50.906342+00', '865d08db-e0fc-4adb-9101-47a24c3f3b5e');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('e88c0cd5-2e0b-450a-bc67-0757c5578200', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', '2026-02-22 22:28:45.886548+00', '2026-02-22 22:28:45.886548+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('9721a23a-7d23-414c-a667-f74378306440', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', '2026-02-22 22:28:45.960423+00', '2026-02-22 22:28:45.960423+00', NULL, 'aal1', NULL, NULL, 'node', '172.18.0.1', NULL, NULL, NULL, NULL, NULL),
	('86232427-b9b7-41d3-ad69-7910fd08dc6d', '84b4f798-0447-4230-86db-6a2d45858e86', '2026-02-22 22:29:50.915516+00', '2026-02-22 22:29:50.915516+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '172.18.0.1', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('e88c0cd5-2e0b-450a-bc67-0757c5578200', '2026-02-22 22:28:45.88909+00', '2026-02-22 22:28:45.88909+00', 'password', '47fdaabb-7356-4ebe-a26b-f72393e66b5b'),
	('9721a23a-7d23-414c-a667-f74378306440', '2026-02-22 22:28:45.962158+00', '2026-02-22 22:28:45.962158+00', 'password', '699264ce-995c-4770-b2db-7cc8c653dbca'),
	('86232427-b9b7-41d3-ad69-7910fd08dc6d', '2026-02-22 22:29:50.918217+00', '2026-02-22 22:29:50.918217+00', 'password', '4f34dffa-150d-4587-b92f-4225b4d96cbc');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'mebnvt3bxyyw', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', false, '2026-02-22 22:28:45.88799+00', '2026-02-22 22:28:45.88799+00', NULL, 'e88c0cd5-2e0b-450a-bc67-0757c5578200'),
	('00000000-0000-0000-0000-000000000000', 2, '2lilumv4sjqf', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', false, '2026-02-22 22:28:45.961323+00', '2026-02-22 22:28:45.961323+00', NULL, '9721a23a-7d23-414c-a667-f74378306440'),
	('00000000-0000-0000-0000-000000000000', 3, 'sgahvxgl46k4', '84b4f798-0447-4230-86db-6a2d45858e86', false, '2026-02-22 22:29:50.9169+00', '2026-02-22 22:29:50.9169+00', NULL, '86232427-b9b7-41d3-ad69-7910fd08dc6d');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: titles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."titles" ("id", "type", "name", "release_year", "show_name", "season_number", "episode_number", "external_ref", "created_by", "created_at") VALUES
	('f38ad218-e750-4c1b-a45a-2a673ce2dabb', 'movie', 'Test Movie', NULL, NULL, NULL, NULL, NULL, '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', '2026-02-22 22:28:45.988888+00');


--
-- Data for Name: parties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."parties" ("id", "owner_id", "title_id", "name", "visibility", "created_at", "updated_at") VALUES
	('879da3c8-4293-4c23-b58b-a751e7fc6544', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', 'f38ad218-e750-4c1b-a45a-2a673ce2dabb', 'Test Party', 'private', '2026-02-22 22:28:45.99691+00', '2026-02-22 22:28:45.99691+00');


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: party_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."party_members" ("party_id", "user_id", "role", "joined_at") VALUES
	('879da3c8-4293-4c23-b58b-a751e7fc6544', '5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', 'owner', '2026-02-22 22:28:45.99691+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "display_name", "avatar_url", "created_at", "updated_at") VALUES
	('5ffbaa46-c353-48d4-9df0-18ef7c7f9dbf', 'test', NULL, '2026-02-22 22:28:45.870767+00', '2026-02-22 22:28:45.870767+00'),
	('84b4f798-0447-4230-86db-6a2d45858e86', 'raz', NULL, '2026-02-22 22:29:50.901648+00', '2026-02-22 22:29:50.901648+00');


--
-- Data for Name: timeline_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: watch_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 3, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 4lwZ0EJv0WEJ1xMgJv3bk2a3Ja0scmg7OE5zfzA1djfshckGI8t68m7hitpdEug

RESET ALL;
