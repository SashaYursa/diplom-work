<?php

declare(strict_types=1);

namespace App\Articles;

use App\Account\User;
use App\Database\DB;

class Articles
{
    private $db;
    private $tableName = 'articles';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getArticle($id)
    {
        $res['response'] = $this->db->getFromTable($this->tableName, 'id', $id);
        if (!empty ($res['response']['error'])) {
            return false;
        }
        file_exists('articles/images/' . $res['response']['logo'])
            ? $res['response']['logo'] = 'articles/images/' . $res['response']['logo']
            : $res['response']['logo'] = 'empty';
        return $res['response'];
    }

    public function getPacketArticle($limit, $offset, $sortType, $categoryID)
    {
        $direction = 'DESC';
        switch ($sortType) {
            case 'likes':
                $sortType = 'likes_count';
                break;
            case 'views':
                $sortType = 'views';
                break;
            case 'new':
                $sortType = 'created_at';
                break;
            case 'old':
                $sortType = 'created_at';
                $direction = 'ASC';
                break;
            default:
                $sortType = 'views';
        }

        $res['response'] = $this->db->getArticlesWithLimit($limit, $offset, $sortType, $direction, $categoryID);
        foreach ($res['response'] as $key => $response) {
            $res['response'][$key]['category'] = $this->db->getFromTable(
                'articles_category',
                'id',
                $response['category_id']
            );
        }
        if (empty ($res['response'])) {
            return ['response' => false];
        }
        foreach ($res['response'] as $key => $item) {
            file_exists('UserImages/' . $res['response'][$key]['user_image'])
                ? $res['response'][$key]['user_image'] = 'UserImages/' . $res['response'][$key]['user_image']
                : $res['response'][$key]['user_image'] = 'empty';
            file_exists('articles/images/' . $res['response'][$key]['logo'])
                ? $res['response'][$key]['logo'] = 'articles/images/' . $res['response'][$key]['logo']
                : $res['response'][$key]['logo'] = 'empty';
        }
        return $res;
    }

    public function getLastArticles($limit, $offset)
    {
        $res = $this->db->getLastArticles($limit, $offset);
        return $res;
    }

    public function getUserArticles($userID, $limit, $offset, $order, $orderType)
    {
        return $this->db->getPackArticlesForUser($userID, $limit, $offset, $order, $orderType);
    }

    public function addArticle($header, $desc, $body, $images, $imagesInfo, $authorID, $categoriesID)
    {
        $logo = 'empty';
        if (!empty($images)) {
            foreach ($images as $key => $image) {
                $images[$key]['name'] = $imagesInfo->$key->newName;
                $this->saveImage($images[$key], 'articles/images');
            }
            $logo = array_shift($images);
            $logo = $logo['name'];
        }
        $header = htmlspecialchars($header);
        $desc = htmlspecialchars($desc);
        $res['articles'] = $this->db->insertArticle(
            $header,
            $desc,
            $body,
            $logo,
            $authorID,
            $categoriesID
        );
        if (!empty($images)) {
            foreach ($images as $image) {
                $this->db->insertArticleImages($image['name'], $res['articles']['id']);
            }
        }
        return ['logo' => $logo, 'res' => $res];
    }

    public
    function getArticleWithComments(
        $id
    ) {
        $article = $this->getArticle($id);

        if (!$article) {
            return $article;
        }
        $this->addView($id, $article['views']);
        $user = new User();
        $author = $user->getUser('id', strval($article['author_id']));
        $likes = $this->db->getCountElementsWithParam('likes_for_articles', 'id', 'article_id', $id);
        $response['author']['name'] = $author['login'];
        $response['author']['image'] = $author['user_image'];
        $response['comments'] = $this->getComments($id);
        $response['likes'] = $likes[0]['count'];
        $response['created_at'] = $article['created_at'];
        $response['name'] = $article['name'];
        $response['text'] = $article['text'];
        $response['views'] = $article['views'];
        $response['hide'] = $article['hide'];
        return $response;
    }

    public function getCategories()
    {
        return $this->db->getAll('articles_category');
    }

    public function setLike($articleID, $userID)
    {
        $res = [];
        if (empty($this->db->checkLikeForArticle($articleID, $userID))) {
            $res = $this->db->insertLikeForArticle($articleID, $userID);
        } else {
            $res = $this->db->removeLike($userID, 'likes_for_articles', 'article_id', $articleID);
        }
        if ($res['ok']) {
            $likes = $this->db->getCountElementsWithParam('likes_for_articles', 'id', 'article_id', $articleID);
            return ['likes' => $likes[0]['count']];
        }
    }

    public function getVisiblePages($categoryID)
    {
        if ($categoryID == 0) {
            return $this->db->getFieldFromTable($this->tableName, 'id', 'hide', 0);
        }
        return $this->db->getFieldFromTableWithCategory(
            $this->tableName,
            'id',
            'hide',
            0,
            'category_id',
            $categoryID,
        );
    }

    public function getPagesForCategory($categoryID)
    {
        $category = $this->db->getFromTable('categories', 'id', $categoryID);
        //$this->db->getCountElementsWithParam()
    }

    private function addView($articleID, $countView)
    {
        $countView = $countView + 1;
        $this->db->addView($this->tableName, $articleID, $countView);
    }

    private
    function getComments(
        $id
    ) {
        return $this->db->getCommentsForArticle($id);
    }

    public
    function getPages()
    {
        $res = $this->db->getCountElements($this->tableName);
        return $res;
    }

    public
    function getArticlesWithLimitForAdmin(
        $offset = 0,
        $limit = 15
    ) {
        $articles = $this->db->getAllWithLimit($this->tableName, $limit, $offset);
        for ($i = 0; $i < count($articles); $i++) {
            $user = $this->db->getFromTable('users', 'id', $articles[$i]['author_id']);
            $articles[$i]['user'] = [
                'login' => $user['login'],
                'is_admin' => $user['is_admin'],
                'user_image' => $user['user_image']
            ];
        }
        return $articles;
    }

    public
    function updateStatus(
        $id,
        $status
    ) {
        $res = [];
        switch ($status) {
            case 'process':
            case 'hide':
                $this->db->updateItemInTable($this->tableName, 'hide', '0', $id);
                $res = ['status' => true, 'message' => 'Переведено в активний статус'];
                break;
            case 'visible':
                $this->db->updateItemInTable($this->tableName, 'hide', '1', $id);
                $res = ['status' => true, 'message' => 'Переведено в неактивний статус'];
                break;
            default:
                $res = ['status' => false];
        }
        return $res;
    }

    public
    function getArticleForEdit(
        $id,
        $user
    ) {
        $res = $this->getArticle($id);
        $createdBy = $user->getUser('id', strval($res['author_id']));
        $res['user'] = [
            'login' => $createdBy['login'],
            'is_admin' => $createdBy['is_admin'],
            'image' => $createdBy['user_image'],
            'email' => $createdBy['email'],
        ];
        return $res;
    }

    private
    function saveImage(
        $file,
        $dir
    ) {
        $tmpName = $file['tmp_name'];
        if (!is_dir($dir)) {
            mkdir($dir);
        }
        if (move_uploaded_file($tmpName, $dir . '/' . $file['name'])) {
            return $file['name'];
        } else {
            return ['error' => 'Файл не збережено'];
        }
    }

    public
    function deleteArticle(
        $id,
        $userID
    ) {
        $element = $this->db->getFromTable($this->tableName, 'id', $id);
        if (intval($element['author_id']) === intval($userID)) {
            $this->db->deleteFromTable($this->tableName, 'id', $id);
            return ['status' => true, 'message' => 'Пост видалено'];
        } else {
            return ['status' => false, 'message' => 'Ви не маєте права видаляти даний пост'];
        }
    }

    public
    function deleteArticlefromAdmin(
        $id
    ) {
        $this->db->deleteFromTable($this->tableName, 'id', $id);
        return true;
    }

    public
    function updateArticle(
        $id,
        $articleName,
        $desc,
        $body,
        $images,
        $imagesInfo,
        $oldImages
    ) {
        $res = [];
        $article = $this->db->getFromTable($this->tableName, 'id', $id);
        $logoIsDeleted = true;
        foreach ($oldImages as $key => $oldImage) {
            if ($oldImage === $article['logo']) {
                unset($oldImages[$key]);
                $logoIsDeleted = false;
            }
        }
        if ($logoIsDeleted) {
            $this->deleteOldLogo($id);
        }

        $deletedImages = 0;
        $allImagesFromDB = $this->db->getAllImagesForArticle($id);
        foreach ($allImagesFromDB as $key => $imageFromDB) {
            $delete = true;
            foreach ($oldImages as $oldImage) {
                if ($imageFromDB['image_name'] === $oldImage) {
                    $delete = false;
                }
            }
            if ($delete) {
                $deletedImages++;
                $this->deleteImage($imageFromDB['image_name']);
                $this->db->deleteFromTable('images_for_articles', 'id', $imageFromDB['id']);
                unset($allImagesFromDB[$key]);
            }
        }
        if ($deletedImages > 0) {
            $res['deletedImages'] = 'Було видалено ' . $deletedImages . ' зображень';
        }
        if (!empty($images)) {
            foreach ($images as $key => $image) {
                $images[$key]['name'] = $imagesInfo->$key->newName;
                $this->saveImage($images[$key], 'articles/images');
                $this->db->insertArticleImages($images[$key]['name'], $id);
            }
        }
        $allImagesFromDB = $this->db->getAllImagesForArticle($id);
        $article = $this->db->getFromTable($this->tableName, 'id', $id);
        if ($article['logo'] === 'empty') {
            if (!empty($allImagesFromDB)) {
                $this->db->deleteFromTable('images_for_articles', 'id', $allImagesFromDB[0]['id']);
                $this->setNewLogo($id, $allImagesFromDB[0]['image_name']);
            } else {
                $res['db'] = $allImagesFromDB;
            }
        }
        $this->db->updateArticle($articleName, $desc, $body, $id);
        $res['status'] = true;
        return $res;
    }

    private
    function checkLogo(
        $images,
        $oldLogo
    ) {
        foreach ($images as $key => $image) {
            if ($oldLogo === $image) {
                return ['status' => true, 'key' => $key];
            }
        }
        return ['status' => false];
    }

    private
    function setNewLogo(
        $articleID,
        $imageName
    ) {
        $this->db->updateItemInTable($this->tableName, 'logo', $imageName, $articleID);
    }

    private
    function deleteOldLogo(
        $articleID
    ) {
        $logoName = $this->db->getFromTable($this->tableName, 'id', $articleID);
        $this->db->updateItemInTable($this->tableName, 'logo', 'empty', $articleID);
        if ($this->deleteImage($logoName['logo'])) {
            return true;
        }
        return false;
    }

    private
    function deleteImage(
        $name
    ): bool {
        $path = 'articles/images/' . $name;
        if (file_exists($path)) {
            unlink($path);
            return true;
        }
        return false;
    }
}