require "rails_helper"

describe ParticipantsService do
  let(:service) { ParticipantsService.new }

  describe "participants" do

    it "returns participants across the whole platform at any time" do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:idea_published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'changed', user: pp3)
      end
      create(:activity, item: create(:comment), action: 'created', user: pp4)

      expect(service.participants().map(&:id)).to match_array participants.map(&:id)
    end

    it "returns participants across the whole platform since a given date" do
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      travel_to Time.now - 100.days do
        create(:idea_published_activity, user: pp1)
      end
      travel_to Time.now - 6.days do
        create(:activity, item: create(:comment), action: 'created', user: pp2)
      end
      travel_to Time.now - 2.days do
        create(:activity, item: create(:comment), action: 'changed', user: pp3)
      end
      create(:activity, item: create(:comment), action: 'created', user: pp4)

      expect(service.participants(since: (Time.now-6.days)).map(&:id)).to match_array [pp2.id,pp3.id,pp4.id]
    end

    it "returns participants of a given project at any time" do
      project = create(:continuous_budgeting_project)
      other_project = create(:project)
      participants = create_list(:user, 5)
      pp1, pp2, pp3, pp4, pp5 = participants
      others = create_list(:user, 3)
      
      idea = nil
      other_idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        other_idea = create(:idea, project: other_project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, idea: other_idea, author: others.last)
        create(:basket, ideas: [idea], participation_context: project, user: pp5)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.participants(project: project).map(&:id)).to match_array participants.map(&:id)
    end

    it "returns participants of a given project since a given date" do
      project = create(:project)
      other_project = create(:project)
      participants = create_list(:user, 4)
      pp1, pp2, pp3, pp4 = participants
      others = create_list(:user, 3)
      
      idea = nil
      travel_to Time.now - 100.days do
        idea = create(:idea, project: project, author: pp1)
      end
      travel_to Time.now - 6.days do
        create(:comment, idea: idea, author: pp2)
        create(:idea, project: project, author: others.first)
      end
      travel_to Time.now - 2.days do
        create(:vote, votable: idea, mode: 'up', user: pp3)
        create(:comment, idea: idea, author: pp2)
        create(:comment, author: others.last)
      end
      create(:comment, idea: idea, author: pp4)

      expect(service.participants(project: project, since: (Time.now-5.days)).map(&:id)).to match_array [pp2.id, pp3.id, pp4.id]
    end

  end

  describe "filter_engaging_activities" do

    it "does not filter out an upvote" do
      activity = create(:idea_published_activity)
      expect(service.filter_engaging_activities(Activity.all)).to eq [activity]
    end

    it "filters out an idea changed title activity" do
      activity = create(:idea_changed_title_activity)
      expect(service.filter_engaging_activities(Activity.all)).to be_empty
    end
  end

  describe "with_engagement_scores" do

    it "gives idea publishing a score of 5" do
      activity = create(:idea_published_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 5
    end

    it "gives comment creation a score of 3" do
      activity = create(:comment_created_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 3
    end

    it "gives voting a score of 1" do
      upvote_activity = create(:idea_upvoted_activity)
      downvote_activity = create(:idea_downvoted_activity)
      expect(service.with_engagement_scores(Activity.where(id: upvote_activity.id)).first.score).to eq 1
      expect(service.with_engagement_scores(Activity.where(id: downvote_activity.id)).first.score).to eq 1
    end

    it "returns 0 for non-engaging activities" do
      activity = create(:idea_changed_body_activity)
      expect(service.with_engagement_scores(Activity.where(id: activity.id)).first.score).to eq 0
    end

    it "allows adding other select fields to the query" do
      activity = create(:idea_published_activity)
      scope = service.with_engagement_scores(Activity.where(id: activity.id).select(:user_id))
      expect(scope.first.user_id).to eq activity.user_id
      expect(scope.first.score).to be_present
    end

  end

end