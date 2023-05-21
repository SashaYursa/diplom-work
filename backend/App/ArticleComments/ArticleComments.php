<?php

declare(strict_types=1);

namespace App\ArticleComments;

use App\Database\DB;

class ArticleComments
{
    private $db;
    private $tableName = 'coments_for_articles';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function addComment($comment, $userID, $articleID)
    {
        if ($this->db->addArticleComment($comment, $userID, $articleID)) {
            return $this->db->getCommentsForArticle($articleID);
        }
    }

    public function getPacketCommentsForAdmin($offset = 0, $limit = 15)
    {
        return $this->db->getAllCommentsWithLimit($this->tableName, $limit, $offset);
    }

    public function getPages()
    {
        $res = $this->db->getCountElements($this->tableName);
        return $res;
    }

    public function getComment($id)
    {
        $comment = $this->db->getFromTable($this->tableName, 'id', $id);
        $user = $this->db->getFromTable('users', 'id', $comment['author_id']);
        $article = $this->db->getFromTable('articles', 'id', $comment['article_id']);
        $comment['article']['name'] = $article['name'];
        $comment['article']['logo'] = $article['logo'];
        $comment['article']['created_at'] = $article['created_at'];
        $comment['user']['login'] = $user['login'];
        $comment['user']['user_image'] = $user['user_image'];
        $comment['user']['email'] = $user['email'];
        return $comment;
    }

    public function deleteComment($id, $articleID)
    {
        $this->db->deleteFromTable($this->tableName, 'id', $id);
        return $this->db->getCommentsForArticle($articleID);
    }

    public function deleteCommentByAdmin($id)
    {
        return $this->db->deleteFromTable($this->tableName, 'id', $id);
    }

    public function updateComment($commentID, $text)
    {
        return $this->db->updateItemInTable($this->tableName, 'text', $text, $commentID);
    }

}