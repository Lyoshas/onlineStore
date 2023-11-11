import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('products').del();

    // to insert a new product, we need to know its category id
    const getCategoryIdSubquery = (categoryName: string) => {
        return knex('product_categories')
            .select('id')
            .where({ category: categoryName });
    };

    // Inserts seed entries
    await knex('products').insert([
        {
            title: 'Asus PCI-Ex GeForce RTX 2060 Dual EVO OC Edition 6GB GDDR6',
            price: 14799,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/bebfb189-c1f5-4b53-a47b-9ba97081025f.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/b624d139-5ed5-4844-9d55-cb6c34e87e1d.png',
            quantity_in_stock: 30,
            short_description:
                'Відеокарта ASUS Dual GeForce RTX 2060 EVO відзначається лаконічним дизайном і високою швидкодією.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 1,
        },
        {
            title: "Оперативна пам'ять Kingston Fury DDR4-3200 16384MB PC4-25600 (Kit of 2x8192)",
            price: 2465,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/3be0376f-3e01-4f46-a93e-6119a50bec5b.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/705cba7c-f841-4253-a010-4a9e693a62c1.png',
            quantity_in_stock: 15,
            short_description:
                "Складається з двох односторонніх 8-чіпових модулів (2х8 Гб) зі штатними таймінгами CL16 та підтримкою технології XMP з вшитими профілями розгону пам'яті.",
            category_id: getCategoryIdSubquery('Оперативна пам\'ять'),
            max_order_quantity: 2,
        },
        {
            title: "Комп'ютер ARTLINE Gaming ASUS Edition X43 (X43v33) Ryzen 5 3600/RAM 16ГБ/HDD 1ТБ + SSD 240ГБ/GeForce RTX 3050 8ГБ/Wi-Fi",
            price: 31499,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/c7d3bf2a-8a81-4201-81ed-f20cb7912ac8.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/6732c7f9-ea53-48e5-901d-4faf43612348.png',
            quantity_in_stock: 15,
            short_description:
                'AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 240 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / Wi-Fi / без ОС',
            category_id: getCategoryIdSubquery('Персональні комп\'ютери'),
        },
        {
            title: 'Western Digital Blue 1TB 7200rpm 64MB',
            price: 1529,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/9a62d620-5a6d-445f-94e1-d8f30730d923.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/33da72f1-77c0-4254-8eda-cfc83b484760.png',
            quantity_in_stock: 15,
            short_description:
                'Жорсткий диск WD Blue WD10EZEX є одним з найяскравіших представників серії накопичувачів WD Blue. Відмінною рисою даного жорсткого диска є використання всього однієї пластини ємністю 1 ТБ з частотою обертання 7200 об/хв.',
            category_id: getCategoryIdSubquery('HDD'),
        },
        {
            title: 'Motorola G32 6/128GB Grey',
            price: 6999,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/3d87fc8e-eed4-4bdd-9020-4aa99d85d244.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/f1a9e141-1b95-4519-9a5f-f67c401da8a0.png',
            quantity_in_stock: 16,
            short_description:
                'Motorola G32 з потужною системою камер 50 Мп, 6.5-дюймовим ультрашироким FullHD+ дисплеєм і багатовимірним звуком Dolby Atmos забезпечує отримання унікального користувальницького досвіду. Продуктивний процесор Qualcomm Snapdragon 680 гарантує надшвидку роботу всіх додатків.',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
        {
            title: 'Apple MacBook Pro 16" M1 Pro 512GB 2021',
            price: 114970,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/8bd44131-8cc9-4503-9d38-a784e90220f4.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/14f5c601-96a6-41f2-a22e-9922bb207376.png',
            quantity_in_stock: 20,
            short_description:
                'Екран 16.2" Liquid Retina XDR (3456x2234) 120 Гц, глянсовий / Apple M1 Pro / RAM 16 ГБ / SSD 512 ГБ / Apple M1 Pro Graphics (16 ядер) / без ОД / Wi-Fi / Bluetooth / веб-камера / macOS Monterey / 2.1 кг / сірий',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Монітор 24" Samsung LF24T450 Black',
            price: 6399,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/7f5e2915-66f7-45e0-9802-775db86b86dd.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/e5509eeb-1190-4e8a-b57e-6d45ceacb65c.png',
            quantity_in_stock: 0,
            short_description:
                'Samsung F24T450F Black (LF24T450F) – елегантний монітор середнього цінового сегменту, який пропонує досить високу якість зображення. Модель отримала строгий та практичний дизайн, а функціональна підставка підтримує регулювання кута нахилу, висоти та має можливість повороту у портретний режим.',
            category_id: getCategoryIdSubquery('Монітори'),
        },
        {
            title: 'Ноутбук Acer Aspire 7 A715-42G-R5B1',
            price: 36999,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/255a898a-49da-4df6-88bd-0cf13a44dd2d.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/0d51e340-f487-4f58-a25e-35f977eb6098.png',
            quantity_in_stock: 5,
            short_description:
                'Екран 15.6" IPS (1920x1080) Full HD 144 Гц, матовий / AMD Ryzen 5 5500U (2.1 - 4.0 ГГц) / RAM 8 ГБ / SSD 512 ГБ / nVidia GeForce RTX 3050, 4 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / веб-камера / без ОС / 2.15 кг / чорний',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Samsung Galaxy Tab S7 FE 12.4" 4/64GB Wi-Fi Black',
            price: 17999,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/52816822-d7d4-4c98-b815-47a516751f6b.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/91a8b546-4a4e-407a-9b74-14c7c7751652.png',
            quantity_in_stock: 2,
            short_description:
                'Екран 12.4" (2560x1600) MultiTouch / Qualcomm Snapdragon 778G (2.4 ГГц) / RAM 4 ГБ / 64 ГБ вбудованої пам\'яті + microSD / Wi-Fi / Bluetooth 5.0 / основна камера: 8 Мп, фронтальна - 5 Мп / GPS / ГЛОНАСС / Android / 608 г / чорний',
            category_id: getCategoryIdSubquery('Планшети'),
        },
        {
            title: 'Ноутбук ASUS Laptop X515MA-BR874W (90NB0TH2-M00FH0) Transparent Silver',
            price: 14999,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/f9c0b15a-2f54-49c8-a407-007c4cc1c2cc.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/67c8dc18-3347-498c-a61a-028131b2cf69.png',
            quantity_in_stock: 20,
            short_description:
                'Екран 15.6" (1366x768) WXGA HD, матовий / Intel Celeron N4020 (1.1 - 2.8 ГГц) / RAM 4 ГБ / SSD 256 ГБ / Intel UHD Graphics 600 / без ОД / Wi-Fi / Bluetooth / веб-камера / Windows 11 / 1.8 кг / сріблястий',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Sony PlayStation 5 Digital Edition 825GB White',
            price: 28999,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/64d22b21-b6be-4038-b37c-7e5696b7bd14.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/a6a8ec93-7d54-493f-9990-eba1fd22c03f.png',
            quantity_in_stock: 30,
            short_description:
                "Sony PlayStation 5 – нова консоль п'ятого покоління. Значні зміни торкнулися як внутрішнього наповнення, так і дизайну загалом. Ігрова приставка отримала 8 ядерний 16 потоковий процесор на архітектурі AMD Zen 2, продуктивності якої достатньо для гри в роздільній здатності аж до 8K.",
            category_id: getCategoryIdSubquery('Ігрові консолі'),
        },
    ]);
}
