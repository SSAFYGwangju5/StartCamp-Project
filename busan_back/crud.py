from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

def get_posts(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 10):
    query = db.query(models.Post)
    if search:
        query = query.filter(models.Post.title.contains(search) | models.Post.content.contains(search))
    total = query.count()
    items = query.order_by(models.Post.id.desc()).offset(skip).limit(limit).all()
    return items, total

def get_post(db: Session, post_id: int, increment_view: bool = False):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post and increment_view:
        post.view_count += 1
        db.commit()
        db.refresh(post)
    return post

def create_post(db: Session, post: schemas.PostCreate):
    db_post = models.Post(title=post.title, content=post.content, password=post.password)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post_id: int, post_data: schemas.PostUpdate):
    db_post = get_post(db, post_id)
    if db_post:
        db_post.title = post_data.title
        db_post.content = post_data.content
        db.commit()
        db.refresh(db_post)
    return db_post

def delete_post(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if db_post:
        db.delete(db_post)
        db.commit()
        return True
    return False

def get_location_stats(db: Session):
    stats = db.query(
        models.Location.content_type_name, 
        func.count(models.Location.id)
    ).group_by(models.Location.content_type_name).all()
    return [{"category": row[0], "count": row[1]} for row in stats]

def search_locations_by_keyword(db: Session, keyword: str, limit: int = 5):
    return db.query(models.Location).filter(
        models.Location.title.contains(keyword) | 
        models.Location.addr1.contains(keyword)
    ).limit(limit).all()