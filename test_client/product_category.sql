insert into productCategories (name) values ('Padi');
insert into productCategories (name) values ('Benih Padi');
insert into productCategories (name) values ('Beras');
insert into productCategories (name) values ('Pupuk');
insert into productCategories (name) values ('Obat');
insert into productCategories (name) values ('Jagung');
insert into productCategories (name) values ('Benih Jagung');

insert into products (name, price, stock, productCategoryId) values ('Produk 1', 4000, 56,  4);
insert into products (name, price, stock, productCategoryId) values ('Produk 2', 7000, 190,  1);
insert into products (name, price, stock, productCategoryId) values ('Produk 3', 47000, 120,  4);
insert into products (name, price, stock, productCategoryId) values ('Produk 4', 33000, 85,  3);
insert into products (name, price, stock, productCategoryId) values ('Produk 5', 21000, 84,  2);
insert into products (name, price, stock, productCategoryId) values ('Produk 6', 40000, 154,  2);
insert into products (name, price, stock, productCategoryId) values ('Produk 7', 7000, 89,  2);
insert into products (name, price, stock, productCategoryId) values ('Produk 8', 9000, 67,  1);
insert into products (name, price, stock, productCategoryId) values ('Produk 9', 34000, 123,  2);
insert into products (name, price, stock, productCategoryId) values ('Produk 10', 7000, 78,  4);
insert into products (name, price, stock, productCategoryId) values ('Produk 11', 17000, 91,  4);
insert into products (name, price, stock, productCategoryId) values ('Produk 12', 11000, 86,  2);
insert into products (name, price, stock, productCategoryId) values ('Produk 13', 27000, 136,  6);
insert into products (name, price, stock, productCategoryId) values ('Produk 14', 43000, 93,  5);
insert into products (name, price, stock, productCategoryId) values ('Produk 15', 16000, 156,  5);
insert into products (name, price, stock, productCategoryId) values ('Produk 16', 17000, 67,  4);
insert into products (name, price, stock, productCategoryId) values ('Produk 17', 39000, 162,  3);
insert into products (name, price, stock, productCategoryId) values ('Produk 18', 40000, 143,  5);
insert into products (name, price, stock, productCategoryId) values ('Produk 19', 2000, 94,  1);
insert into products (name, price, stock, productCategoryId) values ('Produk 20', 46000, 83,  5);

insert into users (first_name,last_name,email,is_staff,is_client,confirmed) values (
    "Ilham","Fajri Umar","nooneknow684@gmail.com",0,1,1
);

insert into users (first_name,last_name,email,is_staff,is_client,confirmed) values (
    "Ilham","Fajri Umre","nooneknow686@gmail.com",0,1,1
);

insert into users (first_name,last_name,email,is_staff,is_client,confirmed) values (
    "Ilham","Fajri Akbar","nooneknow685@gmail.com",1,0,1
);

insert into clients(userId,nip,address,city,province) values (
    1,"218309183291823","Kopi","Bandar Lampung","Lampung"
);

insert into clients(userId,nip,address,city,province) values (
    3,"218309183291823","Kopi","Bandar Lampung","Lampung"
);

insert into staffs(userId,is_admin) values(
    2,0
);