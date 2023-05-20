<?php

declare(strict_types=1);

use App\Services\Router;

Router::page('/users', 'users');
Router::page('/articles', 'articles');
Router::page('/arts', 'arts');
Router::page('/admin/users', 'Admin/users');
Router::page('/admin/works', 'Admin/works');
Router::page('/admin/articles', 'Admin/articles');
Router::page('/search', 'search');
Router::page('/main', 'main');
Router::page('/add-article', 'add-article');
Router::page('/articleComment', 'articleComment');
Router::page('/categories', 'categories');

Router::enable();