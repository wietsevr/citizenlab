require 'rails_helper'
require 'rspec_api_documentation/dsl'


def time_boundary_parameters s
  s.parameter :start_at, "Date defining from where results should start", required: false
  s.parameter :end_at, "Date defining till when results should go", required: false
end

def time_series_parameters s
  time_boundary_parameters s
  s.parameter :interval, "Either day, week, month, year", required: true
end

def project_filter_parameter s
  s.parameter :project, "Project ID. Only count ideas that are in the given project", required: false
end

def group_filter_parameter s
  s.parameter :group, "Group ID. Only count ideas posted by users in the given group", required: false
end

def topic_filter_parameter s
  s.parameter :topic, "Topic ID. Only count ideas that have the given topic assigned", required: false
end

def feedback_needed_filter_parameter s
  s.parameter :feedback_needed, "Only count ideas that need feedback", required: false
end


resource "Stats - Ideas" do

  explanation "The various stats endpoints can be used to show certain properties of ideas."

  let!(:now) { Time.now.in_time_zone(@timezone) }

  before do
    @current_user = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    Tenant.current.update!(created_at: now - 3.year)
    @timezone = Tenant.settings('core','timezone')

    @project1 = create(:project)
    @project2 = create(:project)
    @project3 = create(:project)
    @proposed = create(:idea_status, code: 'proposed')
    @ideas_with_topics = []
    @ideas_with_areas = []
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year - 1.months do
      i = create(:idea, project: @project3, idea_status: @proposed)
      create(:official_feedback, idea: i)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 2.months do
      @ideas_with_topics += create_list(:idea_with_topics, 2, project: @project1, idea_status: @proposed)
      @ideas_with_areas += create_list(:idea_with_areas, 3, project: @project2, idea_status: @proposed)
    end
    travel_to (now - 1.year).in_time_zone(@timezone).beginning_of_year + 5.months do
      @ideas_with_topics += create_list(:idea_with_topics, 3, project: @project1, idea_status: @proposed)
      @ideas_with_areas += create_list(:idea_with_areas, 2, project: @project2, idea_status: @proposed)
      create(:idea, project: @project3, idea_status: @proposed)
    end
  end

  get "web_api/v1/stats/ideas_count" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    topic_filter_parameter self
    feedback_needed_filter_parameter self

    example_request "Count all ideas" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:count]).to eq Idea.published.count
    end

    describe "with feedback_needed filter" do
      let(:feedback_needed) { true }

      example_request "Count all ideas that need feedback" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq Idea.published.count - 1
      end

      example "Count all ideas that need feedback for a specific assignee" do
        assignee = create(:admin)
        create(:idea, idea_status: @proposed, assignee: assignee)
        do_request assignee: assignee.id
        
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:count]).to eq 1
      end
    end
  end

  get "web_api/v1/stats/ideas_by_topic" do
    time_boundary_parameters self
    project_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe "with time filters only" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      example_request "Ideas by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expected_topics = @ideas_with_topics.flat_map{|i| i.ideas_topics.map(&:topic_id)}.uniq
        expect(json_response[:series][:ideas].keys.map(&:to_s).compact.uniq - expected_topics).to eq []
        expect(json_response[:series][:ideas].values.map(&:class).uniq).to eq [Integer]
      end
    end

    describe "with project filter" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      before do
        @project = create(:project)
        travel_to start_at + 2.months do
          idea = create(:idea, project: @project, topics: [create(:topic)])
          create(:idea)
        end
      end

      let(:project) { @project.id }

      example_request "Ideas by topic filtered by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].values.inject(&:+)).to eq 1
      end
    end

    describe "with group filter" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      before do
        travel_to start_at + 2.months do
          @group = create(:group)
          create(:idea_with_topics, topics_count: 2, author: create(:user, manual_groups: [@group]))
        end
      end

      let(:group) { @group.id }

      example_request "Ideas by topic filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].values.inject(&:+)).to eq 2
      end
    end
  end

  get "web_api/v1/stats/ideas_by_project" do
    time_boundary_parameters self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe "with time filters only" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      example_request "Ideas by project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].stringify_keys).to match({
          @project1.id => 5,
          @project2.id => 5,
          @project3.id => 1
        })
        expect(json_response[:projects].keys.map(&:to_s)).to match_array [@project1.id, @project2.id, @project3.id]
      end
    end

    describe "with topic filter" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      before do
        travel_to start_at + 4.months do
          idea = create(:idea_with_topics)
          create(:idea)
          @topic = idea.topics.first
        end
      end

      let(:topic) { @topic.id}

      example_request "Ideas by project filtered by topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].values.inject(&:+)).to eq 1
      end
    end

    describe "with group filter" do
      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

      before do
        travel_to start_at + 8.months do
          @group = create(:group)
          user = create(:user, manual_groups: [@group])
          idea = create(:idea, author: user)
          create(:idea)
        end
      end

      let(:group) { @group.id }

      example_request "Ideas by project filtered by group" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].values.inject(&:+)).to eq 1
      end
    end

  end

  get "web_api/v1/stats/ideas_by_area" do
    time_boundary_parameters self
    project_filter_parameter self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }

    example_request "Ideas by area" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expected_areas = @ideas_with_areas.flat_map{|i| i.areas_ideas.map(&:area_id)}.uniq
      expect(json_response[:series][:ideas].keys.map(&:to_s).compact.uniq - expected_areas).to eq []
      expect(json_response[:series][:ideas].values.map(&:class).uniq).to eq [Integer]
    end
  end

  get "web_api/v1/stats/ideas_by_time" do
    time_series_parameters self
    project_filter_parameter self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
    let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }
    let(:interval) { 'day' }

    example_request "Ideas by time (published_at)" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:series][:ideas].size).to eq end_at.yday
      expect(json_response[:series][:ideas].values.inject(&:+)).to eq 11
    end
  end

  get "web_api/v1/stats/ideas_by_time_cumulative" do
    time_series_parameters self
    project_filter_parameter self
    topic_filter_parameter self
    group_filter_parameter self
    feedback_needed_filter_parameter self

    describe "without time filters" do
      let(:interval) { 'day' }

      example "Ideas by time (published_at) cumulative without time filters", document: false do
        do_request
        expect(response_status).to eq 200
      end
    end

    describe "with time filters" do

      let(:start_at) { (now - 1.year).in_time_zone(@timezone).beginning_of_year }
      let(:end_at) { (now - 1.year).in_time_zone(@timezone).end_of_year }
      let(:interval) { 'day' }

      example_request "Ideas by time (published_at) cumulative" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:series][:ideas].size).to eq end_at.yday
        # monotonically increasing
        expect(json_response[:series][:ideas].values.uniq).to eq json_response[:series][:ideas].values.uniq.sort
        expect(json_response[:series][:ideas].values.last).to eq Idea.published.count
      end
    end

  end
end