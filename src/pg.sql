create type campus_type as enum ('Ingolstadt', 'Neuburg');

alter type campus_type owner to postgres;

create type weekday_type as enum (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
);

alter type weekday_type owner to postgres;

create table app_announcements (
    id serial primary key,
    title_de text not null,
    title_en text not null,
    description_de text not null,
    description_en text not null,
    start_date_time timestamp not null,
    end_date_time timestamp not null,
    priority integer not null,
    url text
);

alter table app_announcements owner to postgres;

create table university_sports (
    id serial primary key,
    title_de text not null,
    description_de text,
    title_en text not null,
    description_en text,
    campus campus_type not null,
    location text not null,
    weekday weekday_type not null,
    start_time time not null,
    end_time time,
    requires_registration boolean not null,
    created_at timestamp
    with
        time zone not null,
        updated_at timestamp
    with
        time zone not null,
        e_mail text,
        invitation_link text
);

alter table university_sports owner to postgres;
