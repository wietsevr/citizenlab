class ParticipantsService

  ENGAGING_ACTIVITIES = [
    {item_type: 'Comment', action: 'created', score: 3},
    {item_type: 'Idea', action: 'published', score: 5},
    {item_type: 'Vote', action: 'idea_upvoted', score: 1},
    {item_type: 'Vote', action: 'idea_downvoted', score: 1},
    {item_type: 'Vote', action: 'comment_upvoted', score: 1},
    {item_type: 'Vote', action: 'comment_downvoted', score: 1},
    {item_type: 'Basket', action: 'created', score: 3},
  ]

  PARTICIPANT_ACTIONS = [:posting, :commenting, :idea_voting, :comment_voting, :budgeting]


  def participants options={}
    since = options[:since]
    # After https://stackoverflow.com/a/25356375
    multiwhere = '(activities.item_type, activities.action) IN ('
    multiwhere << (['(?, ?)'] * ENGAGING_ACTIVITIES.size).join(', ') << ')'
    users = User
      .joins(:activities)
      .where(
        multiwhere, 
        *ENGAGING_ACTIVITIES.map{ |h| [h[:item_type], h[:action]] }.flatten
      ).group('users.id')
    if since
      users.where("activities.acted_at::date >= ?", since)
    else
      users
    end
  end

  def ideas_participants ideas, options={}
    since = options[:since]
    actions = options[:actions] || PARTICIPANT_ACTIONS
    participants = User.none
    # Posting
    if actions.include? :posting
      ideas_since = if since 
        ideas.where('created_at::date >= (?)::date', since)  
      else 
        ideas
      end
      participants = participants.or(User.where(id: ideas_since.select(:author_id)))
    end
    # Commenting
    comments = Comment.where(post_id: ideas)
    if actions.include? :commenting 
      comments_since = if since
        comments.where('created_at::date >= (?)::date', since) 
      else
        comments
      end
      participants = participants.or(User.where(id: comments_since.select(:author_id)))
    end
    # Idea voting
    if actions.include? :idea_voting 
      votes = Vote.where(votable_id: ideas)
      votes = votes.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: votes.select(:user_id)))
    end
    # Comment voting
    if actions.include? :comment_voting 
      votes = Vote.where(votable_id: comments)
      votes = votes.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: votes.select(:user_id)))
    end
    participants
  end

  def projects_participants projects, options={}
    since = options[:since]
    actions = options[:actions] || PARTICIPANT_ACTIONS
    ideas = Idea.where(project: projects)
    participants = ideas_participants(ideas, options)
    # Budgeting
    if actions.include? :budgeting 
      participation_context_ids = projects.map(&:id) + Phase.where(project: projects).ids
      baskets = Basket.submitted.where(participation_context_id: participation_context_ids)
      baskets = baskets.where('created_at::date >= (?)::date', since) if since
      participants = participants.or(User.where(id: baskets.select(:user_id)))
    end
    participants
  end

  def topics_participants topics, options={}
    ideas = Idea.with_some_topics(topics.map(&:id))
    ideas_participants ideas, options
  end

  def idea_statuses_participants idea_statuses, options={}
    ideas = Idea.where(idea_status: idea_statuses)
    ideas_participants ideas, options
  end

  # Adapts the passed activities_scope to only take into account activities
  # that should truly be taken into account as actual activity generated by
  # the user. E.g. Creating a vote is a truly engaging activity, whereas
  # receiving project moderation rights is not
  def filter_engaging_activities activities_scope
    output = activities_scope
    ENGAGING_ACTIVITIES.each.with_index do |activity, i|
      if i == 0
        output = output.where(item_type: activity[:item_type], action: activity[:action])
      else
        output = output.or(
          activities_scope.where(item_type: activity[:item_type], action: activity[:action]))
      end
    end
    output
  end

  # Adds a `score` field to the results, indicating the engagement score for the activity
  def with_engagement_scores activities_scope
    activities_scope
      .select("""(CASE 
        #{ENGAGING_ACTIVITIES.map do |activity|
          "WHEN item_type = '#{activity[:item_type]}' AND action = '#{activity[:action]}' THEN #{activity[:score]}" 
          end.join(" ")
        }
      ELSE 0 END) as score""")
  end

end