<?php

declare(strict_types=1);

use App\Categories\Categories;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
$categories = new Categories();
if ($method === 'GET') {
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-all-categories') {
            $res = $categories->getAllCategoriesWithPostsCount();
            echo json_encode($res);
        }
        if ($headers['status'] === 'get-all-categories-without-posts') {
            $res = $categories->getAllCategories();
            echo json_encode($res);
        }
    }
}
if ($method === 'POST') {
    if (isset($_POST['name'])) {
        $res = $categories->addCategory($_POST['name']);
        echo json_encode($res);
    }
}

if ($method === 'DELETE') {
    if (isset($_GET['id'])) {
        $res = $categories->removeCategory($_GET['id']);
        echo json_encode($res);
    }
}
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['id']) and isset($data['name'])) {
        $res = $categories->updateCategory($data['id'], $data['name']);
        echo json_encode($res);
    }
}