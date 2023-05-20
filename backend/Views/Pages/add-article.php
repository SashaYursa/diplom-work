<?php

declare(strict_types=1);

use App\Articles\Articles;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
if ($method === 'POST') {
    $article = new Articles();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($headers['Status'])) {
        if ($headers['Status'] === 'add-article') {
            $imagesInfo = json_decode($_POST['imagesInfo']);
//            if (!empty($_FILES)) {
//                foreach ($_FILES as $key => $val) {
//                    $key = strval($key);
//                    $item = str_replace('_', '.', $key);
//                    $val = str_replace($key, $item, $key);
//                    $_FILES[$key]['name'] = $val;
//                }
//            }
            $res = $article->addArticle(
                $_POST['header'],
                $_POST['desc'],
                $_POST['article'],
                $_FILES,
                $imagesInfo,
                $_POST['userID'],
                $_POST['categoriesID']
            );
            echo json_encode($res);
        }
        if ($headers['Status'] === 'update-article') {
            $imagesInfo = json_decode($_POST['imagesInfo']);
            $oldImages = json_decode($_POST['oldImages']);
            $res = $article->updateArticle(
                $_POST['id'],
                $_POST['header'],
                $_POST['desc'],
                $_POST['article'],
                $_FILES,
                $imagesInfo,
                $oldImages,
            );
            echo json_encode($res);
        }
    }
}