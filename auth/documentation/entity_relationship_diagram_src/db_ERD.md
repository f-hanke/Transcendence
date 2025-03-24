Table users {
  id integer [primary key]
  email text
  pw_hash text
  login_count integer
  display_name text
  image text
  online_status integer
  created_at text
}

Table matches {
  id integer [primary key]
  opponent integer
  body text [note: 'Content of the post']
  user_id integer [not null, note: "foreign key, consider indexing"]
  user_score integer
  opponent_score integer
  date text
}

Table friendships {
  id integer [primary key]
  user1 integer
  user2 integer
}

Table friend_requests {
  id integer [primary key]
  asker integer [note: "sep index"]
  responder integer [note: "sep index"]
  status integer
}

Table blockings {
  id integer [primary key]
  user_id integer
  blocked_user_id integer
}

Ref: matches.user_id > users.id // many-to-one

Ref: blockings.user_id > users.id

Ref user_friends: friendships.user1 > users.id
Ref outgoing: friend_requests.asker > users.id
Ref incoming: friend_requests.responder > users.id
